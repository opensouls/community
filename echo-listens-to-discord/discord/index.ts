// Require the necessary discord.js classes
import { Client, Events, GatewayIntentBits } from 'discord.js'
import dotenv from 'dotenv'
import { SoulGateway } from './soulGateway.js';

dotenv.config()

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

const gateway = new SoulGateway(client)

// Create a new client instance

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  gateway.start()
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);

process.on('SIGINT', async () => {
  console.warn("stopping")
  await gateway.stop()
  await client.destroy()
  process.exit(0)
})
