import {
  ChatMessageRoleEnum,
  Memory,
  MentalProcess,
  createCognitiveStep,
  useActions,
  useProcessMemory,
  useSoulMemory,
  z,
} from "@opensouls/engine";
import { DiscordEventData } from "../../discord/soulGateway.js";
import internalMonologue from "../lib/internalMonologue.js";
import mentalQuery from "../lib/mentalQuery.js";

const userNotes = createCognitiveStep((userName: string) => {
  const params = z.object({
    notes: z.string().describe(`Updated notes on ${userName}.`),
  });

  return {
    schema: params,
    command: ({ soulName: name }: { soulName: string }) => {
      return {
        role: ChatMessageRoleEnum.Assistant,
        name: name,
        content: `
          ## Description
          Write an updated and clear set of notes on ${userName} that ${name} would want to remember.

          ## Rules
          * Keep descriptions as bullet points
          * Keep relevant bullet points from before
          * Use abbreviated language to keep the notes short
          * Analyze the interlocutor's emotions.
          * Do not write any notes about ${name}

          Please reply with the updated notes on ${userName}:
        `,
      };
    },
    postProcess: async (_memory, response: z.infer<typeof params>) => {
      const newMemory = {
        role: ChatMessageRoleEnum.Assistant,
        content: response.notes,
      };
      return [newMemory, response.notes];
    },
  };
});

const modelsChatters: MentalProcess = async ({ workingMemory }) => {
  const { log: engineLog } = useActions();
  const log = (...args: any[]) => {
    engineLog("[modelsChatters]", ...args);
  };

  const lastProcessed = useProcessMemory("");

  let unprocessedMessages = workingMemory.memories.filter((m) => m.role === ChatMessageRoleEnum.User);
  if (unprocessedMessages.length === 0) {
    return workingMemory;
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

    let memory = workingMemory;

    const [, modelQuery] = await mentalQuery(
      memory,
      `${memory.soulName} has learned something new and they need to update the mental model of ${userName}.`
    );

    log(`Update model for ${userName}?`, modelQuery);
    if (modelQuery) {
      let learned;
      [memory, learned] = await internalMonologue(memory, {
        instructions: "What has Julio learned specifically about their chat companion from the last few messages?",
        verb: "noted",
      });

      log("Learnings:", learned);

      let [, learnings] = await userNotes(memory, userName);
      learnings = learnings
        .split("\n")
        .filter((line) => !line.startsWith("- Display name:"))
        .join("\n");
      learnings = `- Display name: "${displayName}"\n${learnings}`;

      userModel.current = learnings;
    }
  }

  const lastMessage = unprocessedMessages.slice(-1)[0];
  lastProcessed.current = getDiscordEventFromMessage(lastMessage)?.messageId || "";

  return workingMemory;
};

function getDiscordEventFromMessage(message: Memory<Record<string, unknown>>) {
  const discordEvent = message.metadata?.discordEvent as DiscordEventData | undefined;
  if (discordEvent?.type === "messageCreate") {
    return discordEvent;
  }

  return undefined;
}

export default modelsChatters;
