import { ChatMessageRoleEnum, CortexStep, Memory, internalMonologue, mentalQuery } from "socialagi";
import { MentalProcess, useActions, useProcessMemory, useSoulMemory } from "soul-engine";
import { DiscordEventData } from "../../discord/soulGateway.js";
import { prompt } from "../lib/prompt.js";

const userNotes = (userName: string) => () => ({
  command: ({ entityName }: CortexStep) => {
    return prompt`      
      ## Description
      Write an updated and clear set of notes on ${userName} that ${entityName} would want to remember.

      ## Rules
      * Keep descriptions as bullet points
      * Keep relevant bullet points from before
      * Use abbreviated language to keep the notes short
      * Analyze the interlocutor's emotions.
      * Do not write any notes about ${entityName}

      Please reply with the updated notes on ${userName}:'
  `;
  },
  process: (_step: CortexStep<any>, response: string) => {
    return {
      value: response,
      memories: [
        {
          role: ChatMessageRoleEnum.Assistant,
          content: response,
        },
      ],
    };
  },
});

const modelsChatters: MentalProcess = async ({ step: initialStep }) => {
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[modelsChatters]", ...args);
  };

  const lastProcessed = useProcessMemory("");

  let unprocessedMessages = initialStep.memories.filter((m) => m.role === ChatMessageRoleEnum.User);
  if (unprocessedMessages.length === 0) {
    return initialStep;
  }

  const isRunningInsideDiscord = getDiscordEventFromMessage(unprocessedMessages[0]) !== undefined;

  if (lastProcessed.current && isRunningInsideDiscord) {
    const idx = unprocessedMessages.findIndex(
      (m) => getDiscordEventFromMessage(m)?.messageId === lastProcessed.current
    );
    if (idx > 0) {
      unprocessedMessages = unprocessedMessages.slice(idx + 1);
    }
  } else {
    unprocessedMessages = [unprocessedMessages.slice(-1)[0]];
  }

  log("Messages to process:", unprocessedMessages.length);

  for (const message of unprocessedMessages) {
    const discordEvent = getDiscordEventFromMessage(message);
    const userName = discordEvent?.atMentionUsername || "Anonymous";
    const displayName = discordEvent?.userDisplayName || "Anonymous";
    const userModel = useSoulMemory(userName, `- Display name: "${displayName}"`);

    let step = initialStep;

    const modelQuery = await step.compute(
      mentalQuery(
        `${step.entityName} has learned something new and they need to update the mental model of ${userName}.`
      )
    );

    log(`Update model for ${userName}?`, modelQuery);
    if (modelQuery) {
      step = await step.next(
        internalMonologue(
          "What has Julio learned specifically about their chat companion from the last few messages?",
          "noted"
        )
      );

      log("Learnings:", step.value);

      userModel.current = await step.compute(userNotes(userName));
    }
  }

  const lastMessage = unprocessedMessages.slice(-1)[0];
  lastProcessed.current = getDiscordEventFromMessage(lastMessage)?.messageId || "";

  return initialStep;
};

function getDiscordEventFromMessage(message: Memory<Record<string, unknown>>) {
  const discordEvent = message.metadata?.discordEvent as DiscordEventData | undefined;
  if (discordEvent?.type === "messageCreate") {
    return discordEvent;
  }

  return undefined;
}

export default modelsChatters;
