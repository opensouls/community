import ThinkerPage from '@/app/thinking-meme/page';
import MadeWithSoulEngine from '@/components/made-with-soul-engine';
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Millenial Simulator",
  description: "No sentence is too big or small for a 'lol' at the end.",
  openGraph: {
    images: [
      {
        url: "https://souls.chat/s/opensouls/thinking-meme/og.png",
        width: 1200,
        height: 630,
        alt: "Millenial Simulator"
      }
    ]
  },
}

export default function Home() {
  return (
    <>
      <ThinkerPage />
      <MadeWithSoulEngine className='absolute w-full bottom-8'/>
    </>
  );
}
