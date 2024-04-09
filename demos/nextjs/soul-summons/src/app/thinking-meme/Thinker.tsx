"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, ActionType, useSoulRoom, useSoulSimple, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import { InputForm, Input, InputTextArea } from '@/components/Messages';
import { MessageBox } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { twMerge } from 'tailwind-merge';

import Markdown from 'react-markdown';
import { useLocalStorage } from '@uidotdev/usehooks';
import { transcode } from 'buffer';

const thinkingSoul = {
    name: 'overthinker',
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-meme',
}

const THOUGHT_STATES: Record<SoulState, string> = {
    'waiting': '/thinking-meme/ThinkingMeme_reply.png',
    'processing': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
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

    useEffect(() => {

        if (localMessages.length === 0) return;
        const lastMessage = localMessages[localMessages.length - 1];

        if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        }
    }, [localMessages])

    const textStyle = 'p-1 tracking-tight text-black' // border-black border-[1px]
    const width = 'min-w-[36em] w-[36em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[36em] h-[36em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'scale-50'
    const showBorder = ''//border-[1px] border-red-500'

    return (
        <>

            <div className={`flex flex-col gap-8 relative bg-white z-[1000] mt-8 mx-auto ${width} ${height}`}>

                <div className={`relative border-[1px] border-black rounded-xl ${width} ${height}`}>

                    <Blinking><ImageLayer src={THOUGHT_STATES[state]} /></Blinking>
                    {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}

                    {/* {state === 'speaking' && <ImageAnimated srcs={THINKING_BUBBLES} />} */}
                    {/* <Blinking rate={2600}>
                        <ImageAnimated srcs={['/thinking-meme/ThinkingMeme_eyes.png', '/thinking-meme/ThinkingMeme_eyes_star.png']} rate={2000} />
                    </Blinking> */}

                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} />
                    <ImageLayer src={'/thinking-meme/ThinkingMeme_input.png'} />

                    <TextBox text={thought}
                        className={`absolute right-[6em] top-[19em] max-w-[10em] min-h-[10em] text-sm opacity-25 ${textStyle} ${showBorder}`}

                    />
                    <TextBox text={said}
                        className={`absolute left-[5em] top-[16em] max-w-[12em] min-h-[10em] text-base font-sans ${textStyle} ${showBorder}`}
                    />
                </div>

                <div className={`absolute top-[5.5em] flex flex-col w-full`}>
                    <InputForm className={`w-[18em] mx-auto z-[100] ${showBorder}`}>
                        <InputTextArea
                            className='w-full border-none bg-transparent focus:border-none outline-0'
                            placeholder={'talk'}
                            maxLength={75}

                        />
                    </InputForm>
                </div>

                {/* <MessageBox messages={messages} className='min-h-36 p-4 rounded-xl' /> */}

            </div>

        </>
    )
}

function TextBox({ text = '', className = '', style = {}, ...props }) {

    const cn = twMerge(`p-1`, className);
    return (
        <Markdown className={cn} {...props} >
            {text}
        </Markdown>
    )
}   
