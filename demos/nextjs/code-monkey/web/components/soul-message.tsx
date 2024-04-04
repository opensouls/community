import { useEffect, useState } from "react";
import BlinkingCursor from "./blinking-cursor";
import { Markdown } from "./markdown";
import Message from "./message";

export default function SoulMessage({ content }: { content: string | AsyncIterable<string> }) {
  const { message } = useContentWithStreaming(content);

  return (
    <Message name="Code Monkey" avatarUrl="/code-monkey.webp">
      {message.length ? <Markdown>{message}</Markdown> : <BlinkingCursor />}
    </Message>
  );
}

function useContentWithStreaming(content: string | AsyncIterable<string>) {
  const isStream = typeof content !== "string";
  const [message, setMessage] = useState(isStream ? "" : content);
  const [doneStreaming, setDoneStreaming] = useState(isStream ? false : true);

  useEffect(() => {
    const readStream = async () => {
      if (!isStream) return;

      for await (const delta of content) {
        if (typeof delta === "string") {
          setMessage((prev) => prev + delta);
        }
      }

      setDoneStreaming(true);
    };

    readStream();
  }, [content, isStream]);

  return { message, doneStreaming };
}
