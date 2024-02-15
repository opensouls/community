import { Perception } from "soul-engine/soul";
import { DiscordEventData } from "../../discord/soulGateway.js";

export function getBotUserIdFromPerception(perception: Perception | null | undefined) {
  return perception?._metadata?.botUserId as string | undefined;
}

export function getDiscordEventFromPerception(
  perception: Perception | null | undefined
): DiscordEventData | undefined {
  if (!perception) {
    return undefined;
  }

  return perception._metadata?.discordEvent as DiscordEventData;
}

export function getMetadataFromPerception(perception: Perception | null | undefined) {
  const botUserId = getBotUserIdFromPerception(perception) || "anonymous-123";
  const discordEvent = getDiscordEventFromPerception(perception);
  const userName = discordEvent?.atMentionUsername || "Anonymous";
  const userDisplayName = discordEvent?.userDisplayName || "Anonymous";

  return {
    botUserId,
    userName,
    userDisplayName,
    discordEvent,
  };
}
