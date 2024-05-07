import { Soul } from "@opensouls/engine";
import { config } from "dotenv";
import { Context, Telegraf } from "telegraf";
import { message } from "telegraf/filters";

async function connectToTelegram() {
  const telegraf = new Telegraf<Context>(process.env.TELEGRAM_TOKEN!);
  telegraf.launch();

  const { username } = await telegraf.telegram.getMe();
  console.log(`Start chatting here: https://t.me/${username}`);

  process.once("SIGINT", () => telegraf.stop("SIGINT"));
  process.once("SIGTERM", () => telegraf.stop("SIGTERM"));

  return telegraf;
}

async function connectTelegramToSoul(telegram: Telegraf<Context>) {
  const soul = new Soul({
    organization: process.env.SOUL_ENGINE_ORGANIZATION!,
    blueprint: process.env.SOUL_ENGINE_BLUEPRINT!,
    token: process.env.SOUL_ENGINE_TOKEN!,
    debug: true,
  });

  await soul.connect();

  let telegramChatId: number | null = null;

  telegram.on(message("text"), async (ctx) => {
    telegramChatId = ctx.message.chat.id;

    soul.dispatch({
      action: "said",
      content: ctx.message.text,
    });
  });

  soul.on("says", async (event) => {
    const content = await event.content();
    await telegram.telegram.sendMessage(Number(telegramChatId), content);
  });
}

async function run() {
  config();
  const telegram = await connectToTelegram();
  connectTelegramToSoul(telegram);
}

run();
