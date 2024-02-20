import { Client, Events, Message, MessageType, ReplyOptions } from "discord.js";
import { ActionEvent, Soul } from "soul-engine/soul";
import { getMetadataFromActionEvent, makeMessageCreateDiscordEvent } from "./eventUtils.js";

export type DiscordEventData = {
  type: "messageCreate";
  messageId: string;
  channelId: string;
  guildId: string;
  userId: string;
  userDisplayName: string;
  atMentionUsername: string;
  repliedToUserId?: string;
};

export type DiscordAction = "chatted" | "joined";

export type SoulActionConfig =
  | {
      type: "says";
      sendAs: "message" | "reply";
    }
  | {
      type: "reacts";
      sendAs: "emoji";
    };

export class SoulGateway {
  private soul;
  private client;

  constructor(client: Client) {
    this.client = client;
    this.soul = new Soul({
      organization: process.env.SOUL_ENGINE_ORG!,
      blueprint: process.env.SOUL_BLUEPRINT!,
      soulId: process.env.SOUL_ID || undefined,
      token: process.env.SOUL_ENGINE_API_KEY || undefined,
      debug: process.env.SOUL_DEBUG === "true",
    });

    this.handleMessage = this.handleMessage.bind(this);
    this.onSoulSays = this.onSoulSays.bind(this);
  }

  start(readyClient: Client<true>) {
    this.soul.on("says", this.onSoulSays);
    this.soul.on("reacts", this.onSoulReact.bind(this));

    this.soul.connect();

    this.soul.setEnvironment({
      botUserId: readyClient.user.id,
      holderVerifyChannel: process.env.HOLDER_VERIFY_CHANNEL!,
    });

    this.client.on(Events.MessageCreate, this.handleMessage);
  }

  stop() {
    this.client.off(Events.MessageCreate, this.handleMessage);

    return this.soul.disconnect();
  }

  async onSoulSays(event: ActionEvent) {
    const { content } = event;

    const { discordEvent, actionConfig } = getMetadataFromActionEvent(event);
    if (!discordEvent) return;

    console.log("soul said something");

    let reply: ReplyOptions | undefined = undefined;
    if (discordEvent.type === "messageCreate" && actionConfig?.sendAs === "reply") {
      reply = {
        messageReference: discordEvent.messageId,
      };
    }

    const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID!);
    if (channel && channel.isTextBased()) {
      await channel.sendTyping();
      channel.send({
        content: await content(),
        reply,
      });
    }
  }

  async onSoulReact(event: ActionEvent) {
    try {
      const { content } = event;

      const { discordEvent } = getMetadataFromActionEvent(event);
      if (!discordEvent) return;

      console.log("soul reacted with emoji");

      if (discordEvent.type === "messageCreate") {
        const { channelId, messageId } = discordEvent;
        const channel = await this.client.channels.fetch(channelId);
        if (channel && channel.isTextBased()) {
          const message = await (channel as any).messages.fetch(messageId);
          if (message) {
            await message.react(await content());
          }
        }
      }
    } catch (e) {
      console.error("error reacting", e);
    }
  }

  async handleMessage(discordMessage: Message) {
    const messageSenderIsBot = !!discordMessage.author.bot;
    const messageSentInCorrectChannel = discordMessage.channelId === process.env.DISCORD_CHANNEL_ID;
    const shouldIgnoreMessage = messageSenderIsBot || !messageSentInCorrectChannel;
    if (shouldIgnoreMessage) {
      return;
    }

    const discordEvent = await makeMessageCreateDiscordEvent(discordMessage);
    const userName = discordEvent.atMentionUsername;

    const userJoinedSystemMessage = discordMessage.type === MessageType.UserJoin;
    if (userJoinedSystemMessage) {
      this.soul.dispatch({
        action: "joined",
        content: `${userName} joined the server`,
        name: userName,
        _metadata: {
          discordEvent,
          botUserId: this.client.user?.id,
        },
      });
      return;
    }

    let content = discordMessage.content;
    if (discordEvent.repliedToUserId) {
      content = `<@${discordEvent.repliedToUserId}> ${content}`;
    }

    this.soul.dispatch({
      action: "chatted",
      content,
      name: userName,
      _metadata: {
        discordEvent,
        botUserId: this.client.user?.id,
      },
    });

    const channel = await this.client.channels.fetch(process.env.DISCORD_CHANNEL_ID!);
    if (channel && channel.isTextBased()) {
      await channel.sendTyping();
    }
  }
}
