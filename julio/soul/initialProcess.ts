import {
  ChatMessageRoleEnum,
  CortexStep,
  decision,
  externalDialog,
  internalMonologue,
  mentalQuery,
} from "socialagi";
import { MentalProcess, useActions, usePerceptions, useRag, useSoulMemory } from "soul-engine";
import { DiscordAction, DiscordEventData } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { getMetadataFromPerception, getUserDataFromDiscordEvent, random } from "./lib/utils.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

export type ActionConfig =
  | {
      type: "says";
      sendAs: "message" | "reply";
    }
  | {
      type: "reacts";
      sendAs: "emoji";
    };

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log } = useActions();
  const { invokingPerception, pendingPerceptions } = usePerceptions();

  const action = invokingPerception?.action ?? ("chatted" as DiscordAction);

  const maximumQueuedPerceptions = 10;
  const shouldIgnorePerception = pendingPerceptions.current.length > maximumQueuedPerceptions;
  if (shouldIgnorePerception) {
    return initialStep;
  }

  const { userName, discordEvent } = getMetadataFromPerception(invokingPerception);

  log("Pending perceptions count:", pendingPerceptions.current.length);
  const isMessageBurstBySamePerson = pendingPerceptions.current.some((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  });
  if (isMessageBurstBySamePerson) {
    log(`Skipping perception from ${userName} due to message burst`);
    return initialStep;
  }

  let step = await rememberUser(initialStep, discordEvent);

  if (action === "joined" || invokingPerception?.content === "JOINED") {
    step = await thinkOfWelcomeMessage(step, userName);
  } else {
    step = await thinkOfReplyMessage(step, userName, discordEvent);
  }

  return await saySomething(step, discordEvent);
};

async function rememberUser(step: CortexStep<any>, discordEvent: DiscordEventData | undefined) {
  const { log } = useActions();

  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  log("Remembering user");
  const userModel = useSoulMemory(userName, `- Display name: "${userDisplayName}"`);
  step = userModel.current
    ? step.withMemory([
        {
          role: ChatMessageRoleEnum.Assistant,
          content: `Julio remembers this about ${userName}:\n${userModel.current}`,
        },
      ])
    : step;

  if (userModel.current) {
    log(`Julio remembers this about ${userName}:\n${userModel.current}`);
  } else {
    log(`Julio has no memories involving ${userName} `);
  }

  return step;
}

async function thinkOfWelcomeMessage(step: CortexStep<any>, userName: string) {
  const { log } = useActions();
  const { withRagContext } = useRag("super-julio");

  log("New member joined the server");

  log("Loading RAG context");
  step = await withRagContext(step);

  step = await step.next(
    internalMonologue(
      `Julio thinks of a welcome message for ${userName}. It's VERY IMPORTANT to mention the 3 levels of the Discord Server: the Welcome Area, the Satoshi Street, and the Collectors' Corner.`
    )
  );

  return step;
}

async function thinkOfReplyMessage(
  step: CortexStep<any>,
  userName: string,
  discordEvent: DiscordEventData | undefined
) {
  const { log, dispatch } = useActions();

  log("Computing emoji");
  const emoji = await step.compute(emojiReaction());

  const actionConfig: ActionConfig = {
    type: "reacts",
    sendAs: "emoji",
  };

  dispatch({
    action: "reacts",
    content: emoji,
    _metadata: {
      discordEvent,
      actionConfig,
    },
  });

  const ragTopics =
    "Julio, Super Julio World, the Super Julio World Discord Server, or Bitcoin Ordinals";
  const needsRagContext = await step.compute(
    decision(`${userName} has asked a question about ${ragTopics}`, ["true", "false"]),
    { model: "quality" }
  );

  if (needsRagContext === "true") {
    await thinkOfReplyWithRag(step, userName);
  } else {
    await thinkOfReplyWithoutRag(step, userName);
  }

  return step;
}

async function thinkOfReplyWithRag(step: CortexStep<any>, userName: string) {
  const { log } = useActions();
  const { withRagContext } = useRag("super-julio");

  log("Loading RAG context");
  step = await withRagContext(step);

  step = await step.next(
    internalMonologue(
      `Julio thinks of an answer to ${userName}'s question based on what was just remembered as a relevant memory.`
    ),
    {
      model: "quality",
    }
  );
}

async function thinkOfReplyWithoutRag(step: CortexStep<any>, userName: string) {
  const julioEmotions = useSoulMemory("emotionalState", defaultEmotion);

  step = await step.next(
    internalMonologue(
      `Feeling ${julioEmotions.current.emotion}, Julio thinks of a response to ${userName}.`
    ),
    {
      model: "quality",
    }
  );
}

async function saySomething(step: CortexStep<any>, discordEvent?: DiscordEventData) {
  const { log, dispatch } = useActions();

  const maxMessages = 3;
  const avgWordsInMessage = 40;

  const lastThought = step.memories.slice(-1)[0];
  const lastThoughtWords = lastThought?.content.toString().split(" ").length;
  const lastThoughtLength = Math.min(lastThoughtWords ?? avgWordsInMessage);
  const parts = Math.min(Math.ceil(lastThoughtLength / avgWordsInMessage), maxMessages);

  for (let i = 1; i <= parts; i++) {
    const maxWords = avgWordsInMessage + Math.floor(random() * 40) - 20;

    log(`Message ${i}/${parts} with ${maxWords} words`);
    const message = `Julio speaks part ${i} of ${parts} of what he just thought, using no more than ${maxWords} words.`;
    const { stream, nextStep } = await step.next(externalDialog(message), {
      stream: true,
      model: "quality",
    });

    const actionConfig: ActionConfig = {
      type: "says",
      sendAs: i === 1 ? "reply" : "message",
    };

    dispatch({
      action: "says",
      content: stream,
      _metadata: {
        discordEvent,
        actionConfig,
      },
    });

    step = await nextStep;

    if (i < parts) {
      const hasFinished = await step.compute(
        mentalQuery("Julio said everything he just thought."),
        {
          model: "quality",
        }
      );

      if (hasFinished) {
        log("Julio already finished his train of thought.");
        break;
      }
    }
  }

  return step;
}

export default initialProcess;
