import ThinkerRoleplay from "./ThinkerRoleplay";
import MadeWithSoulEngine from '@/components/made-with-soul-engine';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Millenial Roleplay",
  description: "No sentence is too big or small for a 'lol' at the end.",
  openGraph: {
    images: [
      {
        url: "https://souls.chat/s/opensouls/thinking-meme/og.png",
        width: 1200,
        height: 630,
        alt: "Millenial Roleplay"
      }
    ]
  },
}

export default function Home() {

  return (
    <main className="m-0 bg-white selection:bg-gray-200 font-serif overflow-hidden"> 
      <ThinkerRoleplay />
      <MadeWithSoulEngine className='absolute w-full bottom-8'/>
    </main>
  );
}
