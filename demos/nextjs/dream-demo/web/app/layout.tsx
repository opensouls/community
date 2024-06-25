import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { fontHeading, fontSans } from "./fonts";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dream Daimon",
  description: "helps you explore your inner world!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn("font-sans", fontSans.variable, fontHeading.variable)}>
        <main className="container max-w-screen-md">{children}</main>
      </body>
    </html>
  );
}
