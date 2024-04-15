import MadeWithSoulEngine from "@/components/MadeWithSoulEngine";
import RegexInput from "@/components/RegexInput";
import { SoulProvider } from "@/components/SoulProvider";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reggie the RegExp",
  openGraph: {
    images: [
      {
        url: "https://souls.chat/s/opensouls/reggie/og.png",
        width: 1200,
        height: 630,
        alt: "Reggie the RegExp"
      }
    ]
  },
}

export default function Home() {
  return (
    <SoulProvider>
      <main className="flex min-h-screen flex-col items-center justify-center space-y-8">
        <RegexInput />
        <div className="fixed bottom-5 sm:bottom-9 w-full">
          <MadeWithSoulEngine />
        </div>
      </main>
    </SoulProvider>
  );
}
