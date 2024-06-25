import { useEffect, useState } from "react";
import BlinkingCursor from "./blinking-cursor";
import { Markdown } from "./markdown";
import Message from "./message";

export default function SoulMessage({ content, messageType }: { content: string | AsyncIterable<string>, messageType?: string }) {
  const { message } = useContentWithStreaming(content);
  const isThinking = messageType === 'thinks';
  const isConjuring = messageType === 'conjures';
  const isMurmuring = messageType === 'murmurs';
  const isVoodooing = messageType === 'voodoo';
  const isDreamModel = messageType === 'dreamModel';

  return (
    <Message
      name={isThinking ? "Daimonic whisper" : isConjuring ? "Dream Genie" : isMurmuring ? "Samantha's inner voice" : isVoodooing ? "Daimonic Samantha" : "Samantha"} 
      avatarUrl={isThinking ? "/kathor.webp" : isConjuring ? "/dreamGenie.webp" : isMurmuring ? "/samantha.webp" : isVoodooing ? "/samantha.webp" : "/samantha.webp"}
    >
      {message.length ? (
        <div style={(isThinking || isConjuring || isMurmuring) ? { fontStyle: 'italic', color: '#707070'} : undefined}>
          <Markdown>{message}</Markdown>
        </div>
      ) : <BlinkingCursor />}
    </Message>
  );
}

function useContentWithStreaming(content: string | AsyncIterable<string>) {
  const isStream = typeof content !== "string";
  const [message, setMessage] = useState(isStream ? "" : content);
  const [doneStreaming, setDoneStreaming] = useState(isStream ? false : true);

  useEffect(() => {
    let active = true;

    const readStream = async () => {
      if (isStream) {
        for await (const delta of content as AsyncIterable<string>) {
          if (active) {
            setMessage((prev) => prev + delta);
          }
        }
        if (active) {
          setDoneStreaming(true);
        }
      } else {
        setMessage(content as string);
      }
    };

    readStream();

    return () => {
      active = false; // Prevents setting state if the component unmounts
    };
  }, [content, isStream]);

  return { message, doneStreaming };
}
