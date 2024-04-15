import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import getAssetPath from "@/lib/assets";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Reggie The Regex",
  description: "A living regex existentially pondering the nature of regexes.",
  icons: getAssetPath("/favicon.ico"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-background">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
