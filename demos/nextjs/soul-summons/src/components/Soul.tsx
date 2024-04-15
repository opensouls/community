"use-client" 

import React, { useEffect, useState, useMemo } from "react"
import { Soul, said } from "@opensouls/soul"
import { MessageWaterfall } from "./Messages";
import { useSoulRoom, useSoulSimple, PLAYER_CHARACTER, MessageProps } from "@/hooks/useSoulRoom";
import { Sprite } from "@/components/Graphics";
import { SoulProps, CharacterProps } from "@/hooks/useSoulRoom";

export default function SoulVoice({ soulID, character }: { soulID: SoulProps, character: CharacterProps }) {

    const { messages, addEvent } = useSoulRoom();
    const { localMessages, state } = useSoulSimple({ soulSettings: soulID, character });

    return (
        <>
            <MessageWaterfall
                messages={localMessages}
                className={'flex grow-1 h-[50em] justify-start bg-[#d4d4d4] opacity-50'}
            />
            {state === 'thinking' && <div className="relative top-0 right-0">
                <div className="absolute inset-x-0 scale-50">
                    <Sprite src="/sprites/thoughts.png" animate={true} />
                </div>
            </div>}
        </>
    )

}
