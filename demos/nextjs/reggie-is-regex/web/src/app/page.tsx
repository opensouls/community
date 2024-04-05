"use client";

import RegexInput from "@/components/RegexInput";
import { SoulProvider } from "@/components/SoulProvider";

export default function Home() {
  return (
    <SoulProvider>
      <main className="flex min-h-screen flex-col items-center justify-center space-y-8">
        <RegexInput />
      </main>
    </SoulProvider>
  );
}
