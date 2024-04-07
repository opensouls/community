import { cn } from "@/lib/utils";
import { useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
import AnimatedEllipsis from "./animated-ellipsis";
import { Button } from "./button";

export default function SendMessageForm({
  isConnecting,
  isThinking,
  onSendMessage,
}: {
  isConnecting: boolean;
  isThinking: boolean;
  onSendMessage: (message: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    const value = message.trim();
    if (!value) return;

    setMessage("");
    await onSendMessage(value);
  };

  return (
    <div>
      {isThinking && (
        <span className="w-52 inline-block rounded-full text-sm text-muted-foreground pl-4 p-2 mb-1 bg-background">
          Code Monkey is thinking
          <AnimatedEllipsis />
        </span>
      )}

      <form
        className="flex gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <ReactTextareaAutosize
          autoFocus
          maxRows={8}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type here!"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={cn(
            "w-full text-lg bg-white rounded-2xl rounded-b-none border-4 border-primary border-b-0 p-4",
            "resize-none focus-visible:outline-none"
          )}
        />
        <Button disabled={isConnecting || isThinking || !message.trim()} type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}
