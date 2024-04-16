import { ActionEvent, Soul } from "@opensouls/engine";
import { useRef, useState } from "react";
import { useOnMount } from "./use-on-mount";

export type Mood = "cranky" | "less cranky" | "cranky again"

export default function useSoul({
  organization,
  blueprint,
  onNewMessage,
  onMoodSwitch,
  onProcessStarted,
}: {
  organization: string;
  blueprint: string;
  onNewMessage: (event: ActionEvent) => void;
  onMoodSwitch: (mood: Mood) => void;
  onProcessStarted: () => void;
}) {
  const soulRef = useRef<Soul | undefined>(undefined);

  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    console.log("connecting soul...");

    const soulInstance = new Soul({
      organization,
      blueprint,
      debug: process.env.NEXT_PUBLIC_SOUL_ENGINE_DEBUG === "true",
      token: process.env.NEXT_PUBLIC_SOUL_ENGINE_TOKEN,
    });

    soulInstance.on("newSoulEvent", (event) => {
      if (event.action === "mainThreadStart") {
        onProcessStarted();
      }
    });

    soulInstance.on("says", async (event) => {
      onNewMessage(event);
    });

    soulInstance.on("switchMood", async (event) => {
      const content = await event.content();
      onMoodSwitch(content as Mood);
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
