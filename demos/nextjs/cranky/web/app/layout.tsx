import { fontCrankyTerminal, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Code Monkey",
  description: "helps you write CODE!",
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
          "relative w-full min-h-screen bg-black font-cranky-terminal text-2xl overflow-x-scroll",
          fontCrankyTerminal.variable,
          fontSans.variable
        )}
      >
        <main className="max-w-screen-2xl">{children}</main>
      </body>
    </html>
  );
}
