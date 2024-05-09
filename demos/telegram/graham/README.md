# Graham

**Soul Designer:** [@dooart](https://github.com/dooart)

Graham is an example soul that can chat with you on Telegram.

![example](soul.png)

## 💬 Example interaction -->

![example](example.png)

## 👾 Running the soul using the Soul Engine web interface

Simply go to the root directory and run:

```bash
npx soul-engine dev
```

## 🎮 Running in Development with Telegram

1. Make sure you were able to run the soul in using the Soul Engine first
1. Create a token for your bot by talking to the `@BotFather` in Telegram
1. Create an `.env` file based on `.env.sample` and fill in the values
1. Start the app by running:

```bash
npx tsx telegram/index.ts
```
