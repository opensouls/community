import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { useState } from "react";
import getAssetPath from "@/lib/assets";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "overthinker",
  description: "A soul made with OpenSouls",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <link rel="icon" href={'https://souls.chat/s/opensouls/thinking-meme/icon.png'} sizes="any" />
      <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no" />
      <body className={inter.className + ' bg-white'}>{children}</body>
    </html>
  );
}
