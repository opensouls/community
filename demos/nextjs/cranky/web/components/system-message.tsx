import { cn } from "@/lib/utils";
import { SystemChatMessage } from "./cranky";

  export default function SystemMessage({ message }: { message: SystemChatMessage }) {
  return (
    <div className={cn("uppercase font-cranky-terminal", `text-c-${message.color ?? "bright-yellow"}`)}>
      <span>&gt; {message.content}</span>
    </div>
  );
}
