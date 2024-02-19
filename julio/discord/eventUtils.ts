import { Message } from "discord.js";
import { ActionEvent } from "soul-engine/soul";
import { DiscordEventData, SoulActionConfig } from "./soulGateway.js";

export function getMetadataFromActionEvent(evt: ActionEvent) {
  return {
    discordEvent: evt._metadata?.discordEvent as DiscordEventData,
    actionConfig: evt._metadata?.actionConfig as SoulActionConfig,
  };
}

export async function makeMessageCreateDiscordEvent(message: Message): Promise<DiscordEventData> {
  let repliedToUserId: string | undefined = undefined;
  if (message.reference && message.reference.messageId) {
    const repliedToMessage = await message.channel.messages.fetch(message.reference.messageId);
    repliedToUserId = repliedToMessage.author.id;
  }

  return {
    type: "messageCreate",
    messageId: message.id,
    channelId: message.channel.id,
    guildId: message.guild?.id || "",
    userId: message.author.id,
    userDisplayName: message.author.displayName,
    atMentionUsername: `<@${message.author.id}>`,
    repliedToUserId,
  };
}
