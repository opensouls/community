import { Client, Events, GuildMember, Message, ReplyOptions } from "discord.js";
import { ActionEvent, Soul, SoulEvent } from "soul-engine/soul";
import {
  getDiscordEventFromActionEvent as getDiscordEventFromSoulActionMetadata,
  makeGuildMemberAddDiscordEvent,
  makeMessageCreateDiscordEvent,
} from "./eventUtils.js";

export type DiscordEventData =
  | {
      type: "messageCreate";
      messageId: string;
      channelId: string;
      guildId: string;
      userId: string;
      displayName: string;
      atMentionUsername: string;
    }
  | {
      type: "guildMemberAdd";
      guildId: string;
      userId: string;
      displayName: string;
      atMentionUsername: string;
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

    this.handleGuildMemberAdd = this.handleGuildMemberAdd.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
    this.onSoulEvent = this.onSoulEvent.bind(this);
    this.onSoulSays = this.onSoulSays.bind(this);
  }

  start(_readyClient: Client<true>) {
    this.soul.on("newSoulEvent", this.onSoulEvent);
    this.soul.on("says", this.onSoulSays);
    this.soul.on("reacts", this.onSoulReact.bind(this));

    this.soul.connect();

    this.client.on(Events.GuildMemberAdd, this.handleGuildMemberAdd);
    this.client.on(Events.MessageCreate, this.handleMessage);
  }

  stop() {
    this.client.off(Events.MessageCreate, this.handleMessage);
    this.client.off(Events.GuildMemberAdd, this.handleGuildMemberAdd);

    return this.soul.disconnect();
  }

  onSoulEvent(evt: SoulEvent) {
    // console.log("soul event!", evt);
  }

  async onSoulSays(evt: ActionEvent) {
    console.log("chats!", evt);
    const { content } = evt;

    const discordEvent = getDiscordEventFromSoulActionMetadata(evt);
    if (!discordEvent) return;

    let reply: ReplyOptions | undefined = undefined;
    if (discordEvent.type === "messageCreate") {
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

  async onSoulReact(evt: ActionEvent) {
    try {
      const { content } = evt;

      const discordEvent = getDiscordEventFromSoulActionMetadata(evt);
      if (!discordEvent) return;

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

  handleGuildMemberAdd(member: GuildMember) {
    const discordEvent = makeGuildMemberAddDiscordEvent(member);
    const userName = discordEvent.atMentionUsername;

    this.soul.dispatch({
      action: "joined",
      content: `${userName} joined the server`,
      name: userName,
      _metadata: {
        discordEvent,
        botUserId: this.client.user?.id,
      },
    });
  }

  handleMessage(discordMessage: Message) {
    const messageSenderIsBot = !!discordMessage.author.bot;
    const messageSentInCorrectChannel = discordMessage.channelId === process.env.DISCORD_CHANNEL_ID;
    const shouldIgnoreMessage = messageSenderIsBot || !messageSentInCorrectChannel;
    if (shouldIgnoreMessage) {
      return;
    }

    const discordEvent = makeMessageCreateDiscordEvent(discordMessage);
    const userName = discordEvent.atMentionUsername;

    this.soul.dispatch({
      action: "chatted",
      content: discordMessage.content,
      name: userName,
      _metadata: {
        discordEvent,
        botUserId: this.client.user?.id,
      },
    });
  }
}
