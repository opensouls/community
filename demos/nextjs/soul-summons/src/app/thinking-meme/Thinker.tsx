"use client"

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useSoulRoom, useSoulSimple } from '@/hooks/useSoulRoom';
import { Input } from '@/components/Soul';
import { MessageBox } from '@/components/Messages';

const thinkingSoul = {
    name: 'overthinker',
    color: 'thinking-soul',
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-soul',
}

export default function Thinker() {

    const { messages } = useSoulRoom();
    const { localMessages, state } = useSoulSimple({ soulID: thinkingSoulID, character: thinkingSoul });

    return (
        <>
            <p>whats up?</p>

            <Input />
            <MessageBox messages={messages} />

            <div className='flex flex-col bg-white'>

                <p>whats up?</p>
                <div className='relative bg-green m-auto w-[24em] h-[24em]'>
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />

                </div>

            </div>
        </>
    )
}

function ImageLayer({ src = '', alt = '' }) {

    return (
        <Image
            className='absolute m-auto'
            src={src}
            alt={alt}
            width={500}
            height={500}
        />
    )
}