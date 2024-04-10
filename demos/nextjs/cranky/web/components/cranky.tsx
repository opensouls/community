"use client";

import { ActionEvent, said } from "@opensouls/engine";
import Image from "next/image";
import { Fragment, useState } from "react";
import { renderText } from "../lib/render-text";
import useSoul from "../lib/use-soul";
import SendMessageForm from "./send-message-form";
import SoulMessage from "./soul-message";
import UserMessage from "./user-message";
import MadeWithSoulEngine from "./made-with-soul-engine";
import getAssetPath from "@/lib/assets";

export type UserChatMessage = {
  type: "user";
  content: string;
};

export type SoulChatMessage = {
  type: "soul";
  content: string;
  color: string;
};

export type ChatMessage = UserChatMessage | SoulChatMessage;

export default function Cranky() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);

  const { soul, isConnected } = useSoul({
    organization: process.env.NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION!,
    blueprint: process.env.NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT!,
    onNewMessage: async (event: ActionEvent) => {
      const format = event._metadata?.format as {
        font: string;
        color: string;
      };
      const content = await event.content();
      const rendered = await renderText(content, format);

      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "soul",
          content: rendered as string,
          color: format.color,
        },
      ]);
    },
    onProcessStarted: () => {
      if (!isThinking) {
        setIsThinking(true);
      }
    },
  });

  async function handleSendMessage(message: string) {
    if (!soul || !isConnected) {
      throw new Error("Soul not connected");
    }

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        content: message,
      },
    ]);

    await soul.dispatch(said("User", message));

    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <div className="py-6">
      {messages.length > 0 && (
        <div className="pb-10 font-sans">
          <MadeWithSoulEngine />
        </div>
      )}

      <div className="flex flex-col gap-6 pb-64 px-8">
        {messages.length === 0 ? (
          <div className="flex flex-col w-full min-h-screen items-center sm:justify-center gap-8 sm:gap-20">
            <Image
              loader={({ src }) => getAssetPath(src)}
              src="/splash.png"
              width={512}
              height={512}
              alt="Cranky, the misanthrope ASCII artist"
              priority
            />
            <span className="text-center text-c-green sm:text-3xl">{`Use the text input below to send Cranky a message (at your own risk).`}</span>
          </div>
        ) : (
          messages.map((message, i) => (
            <Fragment key={i}>
              {message.type === "user" ? (
                <UserMessage>{message.content}</UserMessage>
              ) : (
                <SoulMessage message={message} />
              )}
            </Fragment>
          ))
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 w-full bg-black px-8 py-4">
        <SendMessageForm isConnecting={!isConnected} isThinking={isThinking} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
