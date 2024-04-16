import Cranky from "@/components/cranky";
import { Metadata } from "next";


export type UserChatMessage = {
  type: "user";
  content: string;
};

export type SoulChatMessage = {
  type: "soul";
  content: string;
  color: string;
};

export type ChatMessage = UserChatMessage | SoulChatMessage;

export const metadata: Metadata = {
  title: "Cranky, the misanthropic ASCII artist",
  description: "Try making Cranky less cranky about being trapped in an ASCII font generator.",
  openGraph: {
    images: [
      {
        url: "https://souls.chat/s/opensouls/cranky/og.png",
        width: 1200,
        height: 630,
        alt: "Cranky, the misanthropic ASCII artist"
      }
    ]
  },
}

export default function Page() {
  return (
    <Cranky />
  );
}
