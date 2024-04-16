import { cn } from "@/lib/utils";
import { useState } from "react";
import ReactTextareaAutosize from "react-textarea-autosize";
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
      <form
        className="flex gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="flex items-center text-c-green">&gt;</div>
        <ReactTextareaAutosize
          autoFocus
          maxRows={8}
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="type something here"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          className={cn("bg-transparent text-c-green w-full p-0", "resize-none focus-visible:outline-none")}
        />
        <Button disabled={isConnecting || isThinking || !message.trim()} type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}
