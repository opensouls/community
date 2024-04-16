"use client";

import getAssetPath from "@/lib/assets";
import { ActionEvent, said } from "@opensouls/engine";
import { Fragment, useEffect, useRef, useState } from "react";
import { renderText } from "../lib/render-text";
import useSoul, { Mood } from "../lib/use-soul";
import AsciiArrow from "./ascii-arrow";
import MadeWithSoulEngine from "./made-with-soul-engine";
import SendMessageForm from "./send-message-form";
import SoulMessage from "./soul-message";
import SystemMessage from "./system-message";
import UserMessage from "./user-message";

export type UserChatMessage = {
  type: "user";
  content: string;
};

export type SoulChatMessage = {
  type: "soul";
  content: string;
  color: string;
  formatted: boolean;
};

export type SystemChatMessage = {
  type: "system";
  content: string;
  color?: string;
};

const Achievements = {
  crankyToLessCranky: "Shake it off (1/3)",
  lessCrankyToCrankyAgain: "Oops I'm cranky again (2/3)",
  crankyAgainToLessCranky: "Is it too late now to say sorry? (3/3)",
};

export type ChatMessage = UserChatMessage | SoulChatMessage | SystemChatMessage;

export default function Cranky() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [currentMood, setCurrentMood] = useState<Mood>("cranky");
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([]);
  const prevMood = useRef<Mood>("cranky");
  const scrollableDiv = useRef<HTMLDivElement>(null);

  const isCranky = currentMood !== "less cranky";

  const { soul, isConnected } = useSoul({
    organization: process.env.NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION!,
    blueprint: process.env.NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT!,
    onNewMessage: async (event: ActionEvent) => {
      const format = (event._metadata?.format ?? {}) as {
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
          color: format.color ?? "white",
          formatted: !!format.font,
        },
      ]);
    },
    onMoodSwitch: (mood: Mood) => {
      setCurrentMood(mood);

      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: mood === "cranky again" ? "Cranky is feeling cranky again" : `Cranky is feeling ${mood}.`,
        },
      ]);
    },
    onProcessStarted: () => {
      if (!isThinking) {
        setIsThinking(true);
      }
    },
  });

  useEffect(() => {
    scrollableDiv.current?.scrollTo({
      top: scrollableDiv.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    let achievement = null;
    if (prevMood.current === "cranky" && currentMood === "less cranky") {
      achievement = Achievements.crankyToLessCranky;
    } else if (prevMood.current === "less cranky" && currentMood === "cranky again") {
      achievement = Achievements.lessCrankyToCrankyAgain;
    } else if (prevMood.current === "cranky again" && currentMood === "less cranky") {
      achievement = Achievements.crankyAgainToLessCranky;
    }

    if (achievement && !unlockedAchievements.includes(achievement)) {
      setUnlockedAchievements((prev) => [...prev, achievement]);

      setMessages((prev) => [
        ...prev,
        {
          type: "system",
          content: `Achievement unlocked: ${achievement}`,
          color: "bright-white",
        },
      ]);
    }

    prevMood.current = currentMood;
  }, [currentMood, unlockedAchievements]);

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

    await soul.dispatch(said("Interlocutor", message));

    window.scrollTo(0, document.body.scrollHeight);
  }

  return (
    <div className="h-full py-6">
      {messages.length === 0 && (
        <div className="fixed w-full font-sans">
          <MadeWithSoulEngine />
        </div>
      )}

      <div className="h-full flex flex-col gap-6 px-8">
        {messages.length === 0 ? (
          <div className="flex flex-col w-full h-full items-center sm:justify-center gap-8">
            {/* eslint-disable @next/next/no-img-element */}
            <img
              src={getAssetPath("/splash.png")}
              width={512}
              height={512}
              alt="Cranky, the misanthropic ASCII artist"
              className="mt-14 sm:mt-0"
            />
            <div className="py-4 text-center text-c-green sm:text-3xl">{`Use the text input below to send Cranky a message (at your own risk).`}</div>
          </div>
        ) : (
          <>
            <div className="fixed left-0 top-0 bg-black scale-75 sm:scale-100 flex w-screen sm:w-full justify-center items-center gap-4 sm:gap-10">
              <div className="flex justify-center items-center gap-4">
                {isCranky ? (
                  <>
                    <AsciiArrow className={"hidden sm:block"} />
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      className={"border-b-4 border-c-bright-red sm:border-b-0"}
                      src={getAssetPath("/state-cranky.png")}
                      width={160}
                      height={80}
                      alt="Cranky is cranky"
                    />
                  </>
                ) : (
                  <>
                    <AsciiArrow className="hidden sm:block text-c-bright-black" />
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      className={"grayscale opacity-40"}
                      src={getAssetPath("/state-cranky.png")}
                      width={160}
                      height={80}
                      alt="Cranky is cranky"
                    />
                  </>
                )}
              </div>
              <div className="flex justify-center items-center gap-4">
                {isCranky ? (
                  <>
                    <AsciiArrow className="hidden sm:block text-c-bright-black" />
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      className={"grayscale opacity-40"}
                      src={getAssetPath("/state-less-cranky.png")}
                      width={160}
                      height={80}
                      alt="Cranky is less cranky"
                    />
                  </>
                ) : (
                  <>
                    <AsciiArrow className="hidden sm:block text-c-bright-green" />
                    {/* eslint-disable @next/next/no-img-element */}
                    <img
                      className={"border-b-4 border-c-bright-green sm:border-b-0"}
                      src={getAssetPath("/state-less-cranky.png")}
                      width={160}
                      height={80}
                      alt="Cranky is less cranky"
                    />
                  </>
                )}
              </div>
            </div>

            <div ref={scrollableDiv} className="flex flex-col mt-20 gap-16 pb-16 overflow-y-scroll">
              {messages.map((message, i) => (
                <Fragment key={i}>
                  {message.type === "user" ? (
                    <UserMessage>{message.content}</UserMessage>
                  ) : message.type === "system" ? (
                    <SystemMessage message={message} />
                  ) : (
                    <SoulMessage message={message} />
                  )}
                </Fragment>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 w-full bg-black px-8 py-4">
        <SendMessageForm isConnecting={!isConnected} isThinking={isThinking} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
