import { cn } from "@/lib/utils";

export default function AsciiArrow({className}: {className?: string}) {
  return <pre className={cn("text-c-red text-[6px] leading-[6px] font-mono whitespace-pre", className)}>
{`           ████░░
  ░░░░░░░░░░░█████░░
░░███████████████████
            ░░█████
          ░░████`}
  </pre>
}