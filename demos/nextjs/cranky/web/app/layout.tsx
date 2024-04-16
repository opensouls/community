import getAssetPath from "@/lib/assets";
import { fontCrankyTerminal, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cranky, the misanthropic ASCII artist",
  description: "Try making Cranky less cranky about being trapped in an ASCII font generator.",
  icons: getAssetPath("/favicon.ico"),
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "relative w-full h-screen bg-black font-cranky-terminal text-2xl overflow-x-scroll",
          fontCrankyTerminal.variable,
          fontSans.variable
        )}
      >
        {children}
      </body>
    </html>
  );
}
