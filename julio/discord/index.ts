import { Client, Events, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { SoulGateway } from "./soulGateway.js";

dotenv.config({ path: "../.env" });

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const gateway = new SoulGateway(client);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  gateway.start(readyClient);
});

client.login(process.env.DISCORD_TOKEN);

process.on("SIGINT", async () => {
  console.warn("stopping");
  await gateway.stop();
  await client.destroy();
  process.exit(0);
});
