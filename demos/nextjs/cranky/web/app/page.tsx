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
  title: "Cranky, the misanthrope ASCII artist",
  openGraph: {
    images: [
      {
        url: "https://souls.chat/s/opensouls/cranky/og.png",
        width: 1200,
        height: 630,
        alt: "Cranky, the misanthrope ASCII artist"
      }
    ]
  },
}

export default function Page() {
  return (
    <Cranky />
  );
}
