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
  onSendMessage: (message: string, verb: string) => Promise<void>;
}) {
  const [message, setMessage] = useState("");
  const [verb, setVerb] = useState("said"); // Default verb
  const [customVerb, setCustomVerb] = useState(""); // Custom verb state

  const handleSubmit = async (e) => {
    e.preventDefault();
    const value = message.trim();
    if (!value) return;
    setMessage("");
    await onSendMessage(value, verb === "custom" ? customVerb : verb);
  };

  return (
    <div>
      {isThinking && (
        <span className="w-52 inline-block rounded-full text-sm text-muted-foreground pl-4 p-2 mb-1 bg-background">
          Samantha is thinking
          <AnimatedEllipsis />
        </span>
      )}
      <form
        className="flex gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          handleSubmit(e);
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
              handleSubmit(e);
            }
          }}
          className={cn(
            "w-full text-lg bg-white rounded-2xl rounded-b-none border-4 border-primary border-b-0 p-4",
            "resize-none focus-visible:outline-none"
          )}
        />
        <select
          value={verb}
          onChange={(e) => setVerb(e.target.value)}
          className="hidden sm:block text-primary font-medium custom-apricot hover:underline z-10 p-2 rounded-2xl border-4 border-primary text-center text-lg h-14 shadow-[0px_4px_0px_#000] transition-transform [&:hover]:scale-110 [&:hover]:rotate-6 [&:focus]:scale-110 [&:focus]:rotate-6 focus-visible:outline-none [&:active]:shadow-none [&:active]:mt-1 [&:active]:-mb-1"
        >
          <option value="said">Said</option>
          <option value="sings">Sings</option>
          <option value="whispers">Whispers</option>
          <option value="hisses">Hisses</option>
          {/* Add more verbs as needed */}
          <option value="custom">Custom</option>
        </select>
        {verb === "custom" && (
          <input
            type="text"
            value={customVerb}
            onChange={(e) => setCustomVerb(e.target.value)}
            placeholder="Muses"
            className="hidden sm:block text-primary font-medium custom-apricot p-2 rounded-2xl border-4 border-primary text-center text-lg h-14 shadow-[0px_4px_0px_#000] transition-transform [&:hover]:scale-110 [&:hover]:rotate-6 [&:focus]:scale-110 [&:focus]:rotate-6 focus-visible:outline-none [&:active]:shadow-none [&:active]:mt-1 [&:active]:-mb-1 w-16 sm:w-24 md:w-32"
          />
        )}
        <Button disabled={isConnecting || isThinking || !message.trim()} type="submit">
          Send
        </Button>
      </form>
    </div>
  );
}