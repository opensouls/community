"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, ActionType, useSoulRoom, useSoulSimple, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import { InputForm, Input, InputTextArea } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

import Markdown from 'react-markdown';

const thinkingSoul = {
    name: 'overthinker',
}

const debugText = 'nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  nice day huh!  '

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

    const [thought, setThought] = useState<string>('');
    const [said, setSaid] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [emotion, setEmotion] = useState<string>('😐');

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
        } else if (lastMessage.type === 'feels') {
            setEmotion(lastMessage.content)
        }

    }, [messages])

    useEffect(() => {

        if (localMessages.length === 0) return;
        const lastMessage = localMessages[localMessages.length - 1];

        if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        }
    }, [localMessages])


    const textStyle = 'p-2 tracking-tight bg-opacity-100' // border-black border-[1px]
    const width = 'min-w-[36em] w-[36em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[36em] h-[36em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'duration-200 scale-[.65] md:scale-100 md:translate-y-[0%] md:translate-x-[0%]'
    const showBorder = ''//border-[1px] border-red-500'
    const stateClassName = {
        'waiting': `${state === 'waiting' ? 'opacity-100' : 'opacity-100'}`,
        'processing': `${state === 'processing' ? 'opacity-100' : 'opacity-100'}`,
        'thinking': `${state === 'thinking' ? 'opacity-100' : 'opacity-100'}`,
        'speaking': `${state === 'speaking' ? 'opacity-100' : 'opacity-100'}`,
    }

    return (
        <>
            <div className={`bg-white w-screen flex justify-center`}>

                <Bentoish className={`relative ${width} ${height} ${scale} `}>

                    <div className=''>

                        <TextBox
                            text={thought}
                            className={`absolute z-[1000] right-[5em] top-[18em] max-w-[11em] text-sm text-gray-400 ${textStyle} ${showBorder} ${stateClassName['thinking']}`}

                        />

                        <TextBox
                            text={said}
                            className={`absolute z-[1000] left-[5em] top-[16em] max-w-[12em] text-base text-black font-sans ${textStyle} ${showBorder} ${stateClassName['speaking']}`}
                        />

                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} className={stateClassName['thinking']} />

                        <Blinking><ImageLayer src={THOUGHT_STATES[state]} /></Blinking>
                        {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}

                        {/* {state === 'speaking' && <ImageAnimated srcs={THINKING_BUBBLES} />} */}
                        {/* <Blinking rate={2600}>
                        <ImageAnimated srcs={['/thinking-meme/ThinkingMeme_eyes.png', '/thinking-meme/ThinkingMeme_eyes_star.png']} rate={2000} />
                    </Blinking> */}

                        <ImageLayer src={'/thinking-meme/ThinkingMeme_input.png'} className={stateClassName['waiting']} />
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} className={stateClassName['speaking']} />

                        {/* <div className='absolute bottom-8 left-20 flex flex-row gap-2'>
                        <p className='text-black'>mood:</p>
                        <p>{emotion}</p>
                    </div> */}
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

                </Bentoish>

            </div>

            <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
                <Bentoish className={`col-span-2 p-4`}>
                    <TextBox text={prompt} className={`text-sm text-gray-400 ${textStyle}`} />
                </Bentoish>

                <Bentoish className={`col-span-2 p-4`}>
                    <TextBox text={debugText} className={`text-sm text-gray-400 ${textStyle}`} />
                </Bentoish>
            </div>
        </>
    )
}

function Bentoish({ className, children }: { className:string, children: React.ReactNode }) {

    const cn = twMerge(`rounded-xl border-[1px] border-black`, className);

    return (
        <div className={cn}>
            {children}
        </div>
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
