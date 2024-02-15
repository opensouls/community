import { ChatMessageRoleEnum, decision, externalDialog, internalMonologue } from "socialagi";
import { MentalProcess, useActions, usePerceptions, useRag, useSoulMemory } from "soul-engine";
import { DiscordAction } from "../discord/soulGateway.js";
import { emojiReaction } from "./lib/emojiReact.js";
import { getMetadataFromPerception } from "./lib/utils.js";
import { defaultEmotion } from "./subprocesses/emotionalSystem.js";

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

  let step = initialStep.withMemory([
    {
      role: ChatMessageRoleEnum.Assistant,
      content: `Julio's Discord user ID is ${botUserId}`,
    },
  ]);

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

  if (action === "joined") {
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

    step = await nextStep;
  } else {
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

      step = await nextStep;
    } else {
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

      step = await nextStep;
    }
  }

  return step;
};

export default initialProcess;
