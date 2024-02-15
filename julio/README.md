# Julio, from Super Julio World

**Soul Designer:** [@dooart](https://github.com/dooart)

Julio is the spirited soul of Super Julio World, a vibrant digital realm filled with digital art collections (Satoshi Streets) created for an audience interested in digital collectibles. Check out https://www.super-julio.com/ to learn more about Julio's world.

## 👾 Running the soul using the Soul Engine web interface

Simply go to the root directory and run:

```bash
npx soul-engine dev
```

## 🎮 Running in Development with Discord

1. Make sure you were able to run the soul in using the Soul Engine first
1. Create a Discord bot and get the bot token. You can follow the instructions [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
1. Enable **all** Privileged Gateway Intents in the bot settings
1. Create an `.env` file based on `.env.sample` and fill in the values
1. Start the Discord bot by running:

```bash
bun discord/index.ts
```

## 🚀 Deploying to Production

1. Make sure you were able to run the soul in using the Soul Engine first
1. Copy the `.env` file to your server
1. Install pm2 and bun globally in your server
1. Run the following commands to start the bot:

```bash
cd discord
pm2 start pm2.config.js
```
