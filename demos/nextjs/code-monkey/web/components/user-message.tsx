import { env } from "@/lib/env";
import Message from "./message";

export default function UserMessage({ children }: { children: string }) {
  return (
    <Message name="You" avatarUrl={env.NEXT_PUBLIC_USER_AVATAR!}>
      {children}
    </Message>
  );
}
