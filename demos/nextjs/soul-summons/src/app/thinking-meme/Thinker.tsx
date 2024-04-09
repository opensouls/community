"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { SoulState, ActionType, useSoulRoom, useSoulSimple } from '@/hooks/useSoulRoom';
import { Input } from '@/components/Messages';
import { MessageBox } from '@/components/Messages';
import { ImageLayer, Blinking } from '@/components/Graphics';

const thinkingSoul = {
    name: 'overthinker',
    color: 'thinking-soul',
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-soul',
}

const THOUGHT_STATES: Record<SoulState, string> = {
    'waiting': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
    'thinking': '/thinking-meme/ThinkingMeme_0002s_0001_enterHead.png',
    'speaking': '/thinking-meme/ThinkingMeme_0002s_0001_exitHead.png',
}

export default function Thinker() {

    const { messages } = useSoulRoom();
    const { localMessages, state } = useSoulSimple({ soulID: thinkingSoulID, character: thinkingSoul });

    return (
        <div>
            <p>whats up?</p>
            <div className='relative flex flex-col bg-white select-none'>

                <Input
                    className='absolute left-8 top-8'
                />
                <p>whats up?</p>
                <div className='relative bg-green m-auto w-[24em] h-[24em]'>
                    <Blinking>
                        <ImageLayer src={THOUGHT_STATES[state]} />
                    </Blinking>
                    {/* <Blinking>
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_eyes.png'} />
                    </Blinking> */}
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} />
                </div>
                <MessageBox messages={messages} className='h-36'/>
            </div>

        </div>
    )
}
