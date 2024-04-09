"use client";

import { Button } from "@/components/button";
import SendMessageForm from "@/components/send-message-form";
import SoulMessage from "@/components/soul-message";
import UserMessage from "@/components/user-message";
import { useOnMount } from "@/lib/hooks/use-on-mount";
import { Soul, said } from "@opensouls/engine";
import { Fragment, useRef, useState } from "react";

export type ChatMessage =
  | {
      type: "user";
      content: string;
    }
  | {
      type: "soul";
      content: string | AsyncIterable<string>;
    };

export default function Page() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const { soul, isConnected, reconnect } = useSoul({
    onNewMessage: async (stream: AsyncIterable<string>) => {
      setIsThinking(false);
      setMessages((prev) => [
        ...prev,
        {
          type: "soul",
          content: stream,
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
      <div className="mb-10 flex justify-between">
        <div>
          <h1 className="h-10 text-2xl font-heading sm:text-3xl tracking-tighter">Code Monkey</h1>
          <h2>
            <code> helps you write CODE!</code>
          </h2>
        </div>

        <div className="flex gap-4">
          <audio ref={audioRef} src="/honk.mp3" hidden></audio>
          <Button
            small
            onClick={() => {
              setTimeout(() => {
                audioRef.current?.play();
              }, 0);
            }}
            className="text-primary font-medium bg-secondary hover:underline"
          >
            HONK
          </Button>

          <Button
            small
            disabled={isConnected && messages.length === 0}
            onClick={() => {
              reconnect().catch(console.error);
              setMessages([]);
            }}
            className="text-primary font-medium [&:not(:disabled):hover]:underline"
          >
            Start over
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-6 pb-64">
        <SoulMessage content="hello! how can i help you today?" />
        {messages.map((message, i) => (
          <Fragment key={i}>
            {message.type === "user" ? (
              <UserMessage>{message.content}</UserMessage>
            ) : (
              <SoulMessage content={message.content} />
            )}
          </Fragment>
        ))}
      </div>
      <div className="container max-w-screen-md fixed inset-x-0 bottom-0 w-full">
        <SendMessageForm isConnecting={!isConnected} isThinking={isThinking} onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}

function useSoul({
  onNewMessage,
  onProcessStarted,
}: {
  onNewMessage: (stream: AsyncIterable<string>) => void;
  onProcessStarted: () => void;
}) {
  const soulRef = useRef<Soul | undefined>(undefined);

  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    console.log("connecting soul...");

    const soulInstance = new Soul({
      organization: process.env.NEXT_PUBLIC_OPENSOULS_ORG!,
      blueprint: process.env.NEXT_PUBLIC_OPENSOULS_BLUEPRINT!,
    });

    soulInstance.on("newSoulEvent", (event) => {
      if (event.action === "mainThreadStart") {
        onProcessStarted();
      }
    });

    soulInstance.on("says", async ({ stream }) => {
      onNewMessage(await stream());
    });

    await soulInstance.connect();
    console.log(`soul connected with id: ${soulInstance.soulId}`);

    soulRef.current = soulInstance;
    setIsConnected(true);
  }

  async function disconnect() {
    if (soulRef.current) {
      await soulRef.current.disconnect();
      setIsConnected(false);
      console.log("soul disconnected");
    }

    soulRef.current = undefined;
  }

  async function reconnect() {
    await disconnect();
    await connect();
  }

  useOnMount(() => {
    connect().catch(console.error);

    return () => {
      disconnect();
    };
  });

  return { soul: soulRef.current, isConnected, reconnect };
}
