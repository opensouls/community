"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, ActionType, useSoulRoom, useSoulSimple, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import { InputForm, Input } from '@/components/Messages';
import { MessageBox } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { twMerge } from 'tailwind-merge';

import Markdown from 'react-markdown';

const thinkingSoul = {
    name: 'overthinker',
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-meme',
}

const THOUGHT_STATES: Record<SoulState, string> = {
    'waiting': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
    'thinking': '/thinking-meme/ThinkingMeme_0002s_0001_enterHead.png',
    'speaking': '/thinking-meme/ThinkingMeme_0002s_0001_exitHead.png',
}
const THINKING_BUBBLES = [
    '/thinking-meme/ThinkingMeme_0001s_0000_thought1.png',
    '/thinking-meme/ThinkingMeme_0001s_0001_thought3.png',
    '/thinking-meme/ThinkingMeme_0001s_0002_thought2.png',
]


export default function Thinker() {

    const { messages } = useSoulRoom();
    const { localMessages, state } = useSoulSimple({ soulID: thinkingSoulID, character: thinkingSoul });

    const [thought, setThought] = useState<string>('prompt blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl  ');
    const [said, setSaid] = useState<string>('prompt blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl  ');
    const [prompt, setPrompt] = useState<string>('prompt blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl blabh blabh abl  ');

    //do some filtering
    useEffect(() => {

        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.character?.name === PLAYER_CHARACTER.name) {
            setPrompt(lastMessage.content)
        } else if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        } else if (lastMessage.type === 'says') {
            setSaid(lastMessage.content)
        }

    }, [messages])

    const textStyle = 'p-1 text-sm tracking-tight border-black border-[1px]'

    return (
        <div>
            {/* <p>whats up?</p> */}
            <div className='relative flex flex-col bg-white select-none z-[1000]'>

                <InputForm className='absolute left-8 top-8'>
                    <Input className='w-24' />
                </InputForm>

                <div className='relative bg-green m-auto w-[36em] h-[36em] border-red border-2 '>

                    <TextBox text={prompt}
                        className={`absolute m-auto top-[1em] max-w-[20em] bg-green-500 ${textStyle}`}
                        style={{ x: '500', y: '500' }}
                    />
                    <TextBox text={thought}
                        className={`absolute right-[5em] top-[17em] max-w-[10em] bg-red-500 ${textStyle}`}
                    />
                    <TextBox text={said}
                        className={`absolute left-[5em] top-[19em] max-w-[14em] min-h-[12em] bg-gray-500 ${textStyle}`}
                    />

                    <Blinking>
                        <ImageLayer src={THOUGHT_STATES[state]} />
                    </Blinking>
                    {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}
                    {/* {state === 'speaking' && <ImageAnimated srcs={THINKING_BUBBLES} />} */}
                    {/* <Blinking>
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_eyes.png'} />
                    </Blinking> */}
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} />
                </div>
                <MessageBox messages={messages} className='h-36' />
            </div>

        </div>
    )
}

function TextBox({ text = '', className = '', ...props }) {

    const cn = twMerge(`p-1 text-sm tracking-tight`, className);
    return (
        <Markdown className={cn} {...props}>
            {text}
        </Markdown>
    )
}   
