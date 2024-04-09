"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, ActionType, useSoulRoom, useSoulSimple, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import { InputForm, Input, InputTextArea } from '@/components/Messages';
import { MessageBox } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { twMerge } from 'tailwind-merge';

import Markdown from 'react-markdown';
import { useLocalStorage } from '@uidotdev/usehooks';

const thinkingSoul = {
    name: 'overthinker',
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-meme',
}

const THOUGHT_STATES: Record<SoulState, string> = {
    'waiting': '/thinking-meme/ThinkingMeme_reply.png',
    'thinking': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
    'speaking': '/thinking-meme/ThinkingMeme_0000s_0001_exitHead.png',
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
            setThought('');
        } else if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        } else if (lastMessage.type === 'says') {
            setSaid(lastMessage.content)
        }

    }, [messages])

    const textStyle = 'p-1 text-sm tracking-tight text-black' // border-black border-[1px]

    return (
        <>

            <div className='flex flex-col gap-4 relative max-w-[36em] bg-white z-[1000] m-auto'>


                <div className='relative h-[36em] border-[1px] border-black'>

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
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_input.png'} />

                    <TextBox text={thought}
                        className={`absolute right-[6em] top-[18em] max-w-[10em] ${textStyle}`}
                    />
                    <TextBox text={said}
                        className={`absolute left-[5em] top-[19em] max-w-[14em] min-h-[12em] ${textStyle}`}
                    />

                </div>

                <div className='absolute top-[5.5em] flex flex-col w-full'>
                    <InputForm className='max-w-[16em] mx-auto z-[100]'>
                        <InputTextArea className='border-none bg-transparent focus:border-none outline-0' placeholder={'say to soul'} />
                    </InputForm>
                </div>


                <MessageBox messages={messages} className='h-36 p-4' />
            </div>

        </>
    )
}

function TextBox({ text = '', className = '', ...props }) {

    const cn = twMerge(`p-1`, className);
    return (
        <Markdown className={cn} {...props}>
            {text}
        </Markdown>
    )
}   
