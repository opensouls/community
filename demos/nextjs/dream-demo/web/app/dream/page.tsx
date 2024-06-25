"use client";

import { useRef, useState, Fragment } from "react";
import { Soul } from "@opensouls/engine";
import { useOnMount } from "@/lib/hooks/use-on-mount";
import SoulMessage from "@/components/soul-message";
import DarkModeBackground from "@/components/DarkModeBackground";
import Link from 'next/link'; // Import Link component
import { Button } from "@/components/button"; // Ensure you import the Button component
import MadeWithSoulEngine from "@/components/MadeWithSoulEngine";
import JoinDiscord from "@/components/JoinDiscord";

export type ChatMessage = {
  type: "soul";
  content: string;
  messageType?: string;
};

export default function DreamPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDarkMode] = useState(true); // Set to true by default

  const { soul, isConnected, reconnect } = useSoul({
    onNewMessage: async (stream: AsyncIterable<string>, type: string) => {
      let fullMessage = '';
      try {
        for await (const messageChunk of stream) {
          fullMessage += messageChunk;
        }
        if (type === 'dreamModel') {
          fullMessage = fullMessage.replace(/[\#*]/g, ''); // Sanitize the message
        }
        setMessages((prev) => [
          ...prev,
          {
            type: "soul",
            content: fullMessage, // Ensure content is a string
            messageType: type,
          },
        ]);
      } catch (error) {
        console.error("Error processing message:", error);
      }
    },
  });

  return (
    <div className="py-6">
      {isDarkMode && <DarkModeBackground />}
      <div className="fixed top-0 left-0 right-0 flex justify-between p-4">
        <div className="hidden sm:block">
          <MadeWithSoulEngine position="left" />
        </div>
        <div className="hidden sm:block">
          <JoinDiscord position="right" />
        </div>
      </div>
      <div className="mb-10 flex justify-center">
          <h1 className={`h-10 text-2xl font-heading sm:text-3xl tracking-tighter text-center ${isDarkMode ? 'matrix-green' : ''}`}>
            Dream log
          </h1>
      </div>
      <div className="flex flex-col gap-6 pb-64">
        {messages.map((message, i) => (
          <Fragment key={i}>
            {message.type === "soul" ? (
              <SoulMessage content={message.content} messageType={message.messageType} />
            ) : (
              <div className={`text-center ${isDarkMode ? 'matrix-green' : 'text-gray-500'}`}>{message.content}</div>
            )}
          </Fragment>
        ))}
        <div className="text-center">
          <Button asChild className="tyrian-purple">
            <Link href="/">
              Return to chat
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function useSoul({
  onNewMessage,
}: {
  onNewMessage: (stream: AsyncIterable<string>, type: string) => void;
}) {
  const soulRef = useRef<Soul | undefined>(undefined);
  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    console.log("connecting soul...");

    const soulInstance = new Soul({
      organization: process.env.NEXT_PUBLIC_OPENSOULS_ORG_ID!,
      blueprint: process.env.NEXT_PUBLIC_OPENSOULS_BLUEPRINT!,
    });

    soulInstance.on("dreamModel", async ({ stream }) => {
      onNewMessage(await stream(), 'dreamModel');
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


