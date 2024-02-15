import { Message } from "discord.js";
import { ActionEvent } from "soul-engine/soul";
import { DiscordEventData } from "./soulGateway.js";

export function getDiscordEventFromActionEvent(evt: ActionEvent) {
  return evt._metadata?.discordEvent as DiscordEventData;
}

export function makeMessageCreateDiscordEvent(message: Message): DiscordEventData {
  return {
    type: "messageCreate",
    messageId: message.id,
    channelId: message.channel.id,
    guildId: message.guild?.id || "",
    userId: message.author.id,
    userDisplayName: message.author.displayName,
    atMentionUsername: `<@${message.author.id}>`,
  };
}
