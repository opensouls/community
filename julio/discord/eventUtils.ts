import { Message } from "discord.js";
import { ActionEvent } from "soul-engine/soul";
import { ActionConfig } from "../soul/initialProcess.js";
import { DiscordEventData } from "./soulGateway.js";

export function getMetadataFromActionEvent(evt: ActionEvent) {
  return {
    discordEvent: evt._metadata?.discordEvent as DiscordEventData,
    actionConfig: evt._metadata?.actionConfig as ActionConfig,
  };
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
