import { ChatMessageRoleEnum, CortexStep } from "socialagi";
import { Perception } from "soul-engine/soul";
import { DiscordAction, DiscordEventData } from "../../discord/soulGateway.js";

export function isRunningInDiscord(perception: Perception | null | undefined) {
  return !!perception?._metadata?.discordEvent;
}

export function getBotUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.botUserId as string | undefined;
}

export function getDiscordActionFromPerception(perception: Perception | null | undefined) {
  return (perception?.action ?? "chatted") as DiscordAction;
}

export function getDiscordEventFromPerception(perception: Perception | null | undefined): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export function getMetadataFromPerception(perception: Perception | null | undefined) {
  const botUserId = getBotUserIdFromPerception(perception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(perception);
  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  return {
    content: perception?.content,
    botUserId,
    userName,
    userDisplayName,
    discordEvent,
  };
}

export function getUserDataFromDiscordEvent(discordEvent: DiscordEventData | undefined) {
  const userName = discordEvent?.atMentionUsername || "Anonymous";
  const userDisplayName = discordEvent?.userDisplayName || "Anonymous";

  return {
    userName,
    userDisplayName,
  };
}

export function random() {
  const a = 1664525;
  const c = 1013904223;
  const m = 2 ** 32;

  let seed = Date.now();
  seed = (a * seed + c) % m;
  return seed / m;
}

export function newMemory(content: string) {
  return [
    {
      role: ChatMessageRoleEnum.Assistant,
      content,
    },
  ];
}

export function getLastMemory(step: CortexStep) {
  return step.memories.slice(-1)[0]?.content.toString().trim() || null;
}

export function getLastMessageFromUserRole(step: CortexStep) {
  const memory = step.memories
    .slice()
    .reverse()
    .find((memory) => memory.role === ChatMessageRoleEnum.User)
    ?.content.toString()
    .trim();

  if (!memory) {
    return null;
  }

  const content = memory?.split(":")[1]?.trim() || null;
  return { memory, content };
}
