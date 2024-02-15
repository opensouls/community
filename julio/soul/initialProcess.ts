import {
  ChatMessageRoleEnum,
  decision,
  externalDialog,
  internalMonologue,
  mentalQuery,
} from "socialagi";
import { MentalProcess, useActions, usePerceptions, useRag, useSoulMemory } from "soul-engine";
import { DiscordAction } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { getMetadataFromPerception, random } from "./lib/utils.js";
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
  const { log, dispatch } = useActions();
  const { withRagContext } = useRag("super-julio");
  const { invokingPerception, pendingPerceptions } = usePerceptions();

  const action = invokingPerception?.action ?? ("chatted" as DiscordAction);

  const maximumQueuedPerceptions = 10;
  const shouldIgnorePerception = pendingPerceptions.current.length > maximumQueuedPerceptions;
  if (shouldIgnorePerception) {
    return initialStep;
  }

  const { botUserId, userName, userDisplayName, discordEvent } =
    getMetadataFromPerception(invokingPerception);

  const isMessageBurstBySamePerson = pendingPerceptions.current.some((perception) => {
    return getMetadataFromPerception(perception)?.userName === userName;
  });
  if (isMessageBurstBySamePerson) {
    log(`Skipping perception from ${userName} due to message burst`);
    return initialStep;
  }

  let step = initialStep;

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

  if (action === "joined" || invokingPerception?.content === "JOINED") {
    log("New member joined the server");

    log("Loading RAG context");
    step = await withRagContext(step);

    step = await step.next(
      internalMonologue(
        `Julio thinks of a welcome message for ${userName}. He should mention the 3 levels of the Discord Server: the Welcome Area, the Satoshi Street, and the Collectors' Corner.`
      )
    );
  } else {
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

    const julioEmotions = useSoulMemory("emotionalState", defaultEmotion);

    const ragTopics =
      "Julio, Super Julio World, the Super Julio World Discord Server, or Bitcoin Ordinals";
    const needsRagContext = await step.compute(
      decision(`${userName} has asked a question about ${ragTopics}`, ["true", "false"]),
      { model: "quality" }
    );

    if (needsRagContext === "true") {
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
    } else {
      step = await step.next(
        internalMonologue(
          `Feeling ${julioEmotions.current.emotion}, Julio thinks of a response to ${userName}.`
        ),
        {
          model: "quality",
        }
      );
    }
  }

  const maxMessages = 3;
  const avgWordsInMessage = 40;

  const lastThought = step.memories.slice(-1)[0];
  const lastThoughtWords = lastThought?.content.toString().split(" ").length;
  const lastThoughtLength = Math.min(lastThoughtWords ?? avgWordsInMessage);
  const parts = Math.min(Math.ceil(lastThoughtLength / avgWordsInMessage), maxMessages);

  let wordsLeft = lastThoughtLength;
  for (let i = 1; i <= parts; i++) {
    const maxWords = avgWordsInMessage + Math.floor(random() * 40) - 20;
    wordsLeft -= maxWords;

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

    const hasFinished = await step.compute(mentalQuery("Julio said everything he just thought."), {
      model: "quality",
    });

    if (hasFinished) {
      log("Julio already finished his train of thought.");
      break;
    }
  }

  return step;
};

export default initialProcess;
