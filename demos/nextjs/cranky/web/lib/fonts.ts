import { VT323, Inter as FontSans } from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontCrankyTerminal = VT323({
  weight: "400",
  variable: "--font-cranky-terminal",
  subsets: ["latin-ext"],
});
