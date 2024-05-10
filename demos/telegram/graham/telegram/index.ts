import { Soul } from "@opensouls/engine";
import { config } from "dotenv";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

const souls: Record<string, Soul> = {};

async function connectToTelegram() {
  const telegraf = new Telegraf<Context>(process.env.TELEGRAM_TOKEN!);
  telegraf.launch();

  const { username } = await telegraf.telegram.getMe();
  console.log(`Start chatting here: https://t.me/${username}`);

  process.once("SIGINT", () => telegraf.stop("SIGINT"));
  process.once("SIGTERM", () => telegraf.stop("SIGTERM"));

  return telegraf;
}

async function setupTelegramSoulBridge(telegram: Telegraf<Context>, telegramChatId: number) {
  if (souls[telegramChatId]) {
    return souls[telegramChatId];
  }

  const soul = new Soul({
    soulId: String(telegramChatId),
    organization: process.env.SOUL_ENGINE_ORGANIZATION!,
    blueprint: process.env.SOUL_ENGINE_BLUEPRINT!,
  });

  soul.on("says", async (event) => {
    const content = await event.content();
    await telegram.telegram.sendMessage(Number(telegramChatId), content);
  });

  await soul.connect();

  souls[telegramChatId] = soul;

  return soul;
}

async function connectToSoulEngine(telegram: Telegraf<Context>) {
  telegram.on(message("text"), async (ctx) => {
    const telegramChatId = ctx.message.chat.id;
    const soul = await setupTelegramSoulBridge(telegram, ctx.message.chat.id);

    soul.dispatch({
      action: "said",
      content: ctx.message.text,
    });

    await ctx.telegram.sendChatAction(telegramChatId, "typing");
  });
}

async function run() {
  config();
  const telegram = await connectToTelegram();
  connectToSoulEngine(telegram);
}

run();
