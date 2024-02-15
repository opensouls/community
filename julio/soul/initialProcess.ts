import { ChatMessageRoleEnum, decision, externalDialog, internalMonologue } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useRag, useSoulMemory } from "soul-engine";
import { Perception } from "soul-engine/soul";
import { DiscordEventData } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

const initialProcess: MentalProcess = async ({ step: initialStep }) => {
  const { log, dispatch } = useActions();
  const { withRagContext } = useRag("super-julio");
  const { invokingPerception, pendingPerceptions } = usePerceptions();

  const maximumQueuedPerceptions = 10;
  const shouldIgnorePerception = pendingPerceptions.current.length > maximumQueuedPerceptions;
  if (shouldIgnorePerception) {
    return initialStep;
  }

  const botUserId = getBotUserIdFromPerception(invokingPerception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(invokingPerception);
  const userName = discordEvent?.atMentionUsername || "Anonymous";
  const displayName = discordEvent?.displayName || "Anonymous";
  const userModel = useSoulMemory(userName, `- Display name: "${displayName}"`);

  const isMessageBurstBySamePerson = pendingPerceptions.current.some((perception) => {
    return getDiscordEventFromPerception(perception)?.atMentionUsername === userName;
  });
  if (isMessageBurstBySamePerson) {
    log(`Skipping perception from ${userName} due to message burst`);
    return initialStep;
  }

  let step = initialStep.withMemory([
    {
      role: ChatMessageRoleEnum.Assistant,
      content: `Julio's Discord user ID is ${botUserId}`,
    },
  ]);

  log("Remembering user");
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

  if (discordEvent && discordEvent.type === "guildMemberAdd") {
    log("New member joined the server");

    step = await step.next(
      internalMonologue(
        "What should Julio explain about the Discord server so a new member knows their way around?"
      )
    );

    log("Loading RAG context");
    step = await withRagContext(step);

    const message = `Julio sends ${userName} a welcome message containing initial directions about the Discord server, and invites them to ask any questions about the server or about Super Julio World. Important: do NOT use the display name in the message, use the at-mention username.`;
    const { stream, nextStep } = await step.next(externalDialog(message), {
      stream: true,
    });
    dispatch({
      action: "says",
      content: stream,
      _metadata: {
        discordEvent,
      },
    });
    return nextStep;
  }

  log("Computing emoji");
  const emoji = await step.compute(emojiReaction());
  dispatch({
    action: "reacts",
    content: emoji,
    _metadata: {
      discordEvent,
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

    const message = `Julio responds directly to ${userName}'s question based on what was just remembered as a relevant memory.`;
    const { stream, nextStep } = await step.next(externalDialog(message), {
      stream: true,
      model: "quality",
    });
    dispatch({
      action: "says",
      content: stream,
      _metadata: {
        discordEvent,
      },
    });

    return nextStep;
  }

  const message = `Julio feels ${julioEmotions.current.emotion} and responds to ${userName},`;
  const { stream, nextStep } = await step.next(externalDialog(message), {
    stream: true,
    model: "quality",
  });
  dispatch({
    action: "says",
    content: stream,
    _metadata: {
      discordEvent,
    },
  });

  return nextStep;
};

function getBotUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.botUserId as string | undefined;
}

function getDiscordEventFromPerception(
  perception: Perception | null | undefined
): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export default initialProcess;
