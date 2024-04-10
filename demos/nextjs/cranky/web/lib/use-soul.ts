import { ActionEvent, Soul } from "@opensouls/engine";
import { useRef, useState } from "react";
import { useOnMount } from "./use-on-mount";

export default function useSoul({
  organization,
  blueprint,
  onNewMessage,
  onProcessStarted,
}: {
  organization: string;
  blueprint: string;
  onNewMessage: (event: ActionEvent) => void;
  onProcessStarted: () => void;
}) {
  const soulRef = useRef<Soul | undefined>(undefined);

  const [isConnected, setIsConnected] = useState(false);

  async function connect() {
    console.log("connecting soul...");

    const soulInstance = new Soul({
      organization,
      blueprint,
    });

    soulInstance.on("newSoulEvent", (event) => {
      if (event.action === "mainThreadStart") {
        onProcessStarted();
      }
    });

    soulInstance.on("says", async (event) => {
      onNewMessage(event);
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
