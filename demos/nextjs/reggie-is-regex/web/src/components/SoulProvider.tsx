"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Soul } from '@opensouls/soul';
import { nanoid } from 'nanoid';

if (!process.env.NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT || !process.env.NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION) {
  throw new Error("Please provide NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT and NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION in your .env file")
}

const soul = new Soul({
  organization: process.env.NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION,
  blueprint: process.env.NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT,
  soulId: (typeof localStorage !== "undefined" && localStorage.getItem("soulId")) || "",
});

const SoulContext = createContext<Soul>(soul);

export const useSoul = () => useContext(SoulContext);

export const SoulProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soulId, setSoulId] = useState<string>((typeof localStorage !== "undefined" && localStorage.getItem("soulId")) || "");

  useEffect(() => {
    if (!soulId) {
      const newId = nanoid();
      console.log("New soul id", newId)
      localStorage.setItem("soulId", newId);
      setSoulId(newId)
      soul.soulId = newId;
      return
    }
    if (soulId === soul.soulId) {
      soul.connect().then(() => {
        console.log("Connected to soul", soul.soulId);
      })
    }
  }, [soulId])

  return (
    <SoulContext.Provider value={soul}>
      {children}
    </SoulContext.Provider>
  );
};

