import { ChatMessageRoleEnum } from "socialagi";
import { Perception } from "soul-engine/soul";
import { DiscordEventData } from "../../discord/soulGateway.js";

export function getDiscordUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.discordUserId as string | undefined;
}

export function getDiscordEventFromPerception(perception: Perception | null | undefined): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export function getMetadataFromPerception(perception: Perception | null | undefined) {
  const discordUserId = getDiscordUserIdFromPerception(perception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(perception);
  const { userName, userDisplayName } = getUserDataFromDiscordEvent(discordEvent);

  return {
    content: perception?.content,
    discordUserId,
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

export function newMemory(content: string) {
  return [
    {
      role: ChatMessageRoleEnum.Assistant,
      content,
    },
  ];
}
