import { cn } from "@/lib/utils";
import { SoulChatMessage } from "./cranky";

export default function SoulMessage({ message }: { message: SoulChatMessage }) {
  return (
    <div className="mb-8">
      <div className="text-c-white">Cranky: </div>
      <pre className={cn("text-[10px] leading-[10px] sm:text-xs sm:leading-3 font-mono", `text-c-${message.color}`)}>{message.content}</pre>
    </div>
  );
}
