import { Client, Events, Message } from "discord.js";
import { ActionEvent, Soul, SoulEvent } from "soul-engine/soul";


export class SoulGateway {
  private soul
  private client

  constructor(client: Client) {
    this.client = client
    this.soul = new Soul({
      organization: "tobowers",
      blueprint: "echo-listens-to-discord",
      token: process.env.SOUL_ENGINE_API_KEY,
      soulId: process.env.SOUL_ID,
      local: true,
      debug: true,
    })

    this.handleMessage = this.handleMessage.bind(this)
    this.onSoulEvent = this.onSoulEvent.bind(this)
    this.onChats = this.onChats.bind(this)
  }

  start() {
    this.soul.on("newSoulEvent", this.onSoulEvent)
    this.soul.on('chats', this.onChats)
   
    this.soul.connect()

    this.client.on(Events.MessageCreate, this.handleMessage);
  }

  stop() {
    this.client.off(Events.MessageCreate, this.handleMessage);

    return this.soul.disconnect() // this handles listener cleanup
  }

  handleMessage(discordMessage: Message) {
    // Ignore messages from bots
    if (discordMessage.author.bot) return;

    // bot experimentation channel:
    if (discordMessage.channelId !== process.env.CHANNEL_ID) return;

    this.soul.dispatch({
      action: "chatted",
      content: discordMessage.content,
      name: discordMessage.author.username,
      _metadata: {
        discordMessage: {
          id: discordMessage.id,
          channelId: discordMessage.channelId,
          guildId: discordMessage.guildId,
          authorId: discordMessage.author.id,
          username: discordMessage.author.username,
        }
      }
    })
  }

  onSoulEvent(evt: SoulEvent) {
    console.log("soul event!", evt)
  }

  async onChats(evt: ActionEvent) {
    console.log("chats!", evt)
    const { content } = evt

    const channel = await this.client.channels.fetch(process.env.CHANNEL_ID!)
    if (channel && channel.isTextBased()) {
      channel.send({
        content: await content(),
      })
    }

  }
}
