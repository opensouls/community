"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, useSoulRoom, useSoulSimple, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import { MessageBox, InputForm, Input, InputTextArea } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

import Markdown from 'react-markdown';

const thinkingSoul = {
    name: 'overthinker',
}

console.log("API", process.env.NEXT_PUBLIC_SOUL_APIKEY);

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-meme',
    token: process.env.NEXT_PUBLIC_SOUL_APIKEY,
    debug: true,
}

export enum ANIMATIONS {
    idle = 'idle',
    gone = 'gone',
    angry = 'angry'
}
export type AnimationType = keyof typeof ANIMATIONS;

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
    const { localMessages, state, metadata } = useSoulSimple({ soulID: thinkingSoulID, character: thinkingSoul });

    const [thought, setThought] = useState<string>(``);
    const [said, setSaid] = useState<string>(''); //hey, whats up
    const [prompt, setPrompt] = useState<string>('');
    const [emotion, setEmotion] = useState<string>('😐');
    const [cycle, setCycle] = useState<string>('0');

    //do some filtering
    useEffect(() => {

        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.character?.name === PLAYER_CHARACTER.name) {
            setPrompt(lastMessage.content)
            setThought('');
            setSaid('');
        } else if (lastMessage.type === 'thinks') {
            setThought(`${lastMessage.content}`) // ${emotion}
        } else if (lastMessage.type === 'says') {
            setSaid(lastMessage.content)
        } else if (lastMessage.type === 'feels') {
            setEmotion(lastMessage.content)
        } else if (lastMessage.type === 'state') {
            setCycle(lastMessage.content)
        }

    }, [messages])

    useEffect(() => {

        if (localMessages.length === 0) return;
        const lastMessage = localMessages[localMessages.length - 1];
        console.log('lastMessage', lastMessage);

        if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        }
    }, [localMessages])



    const textStyle = 'p-2 tracking-tight bg-opacity-100' // border-black border-[1px]

    const speechStyle = 'text-lg text-black font-sans';
    const thoughtStyle = 'text-sm text-gray-400';

    const selectedStyle = 'underline';
    const width = 'min-w-[30em] w-[30em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[30em] h-[30em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'duration-200 scale-[.75] md:scale-[1] md:translate-y-[0%] md:translate-x-[0%]'
    const showBorder = ''//border-[1px] border-red-500'
    const characterVisible = `${metadata?.animation !== 'gone' ? 'opacity-100' : 'opacity-0'}`
    const speechBubbleVisible = `${metadata?.animation !== 'gone' && metadata?.animation !== 'angry' ? 'opacity-100' : 'opacity-0'}`

    const stateClassName = {
        'waiting': `${state === 'waiting' ? 'opacity-100' : 'opacity-100'}`,
        'processing': `${state === 'processing' ? 'opacity-100' : 'opacity-100'}`,
        'thinking': `${state === 'thinking' ? 'opacity-100' : 'opacity-100'}`,
        'speaking': `${state === 'speaking' ? 'opacity-100' : 'opacity-100'}`,
    }

    const cycles = [
        'I meet someone new',
        'we talk',
        'I fall in love',
        'they leave',
    ]

    const positions = [
        'w-[50%] top-[7%] left-[30%] text-center',
        'w-[50%] top-[50%] right-[-4%] text-right',
        'w-[50%] bottom-[8%] left-[28%] text-center',
        'w-[50%] top-[49%] left-[-8%] text-left',
    ]

    return (
        <>
            <div className={`w-screen flex justify-center ${scale} mt-[-10em]`}>

                <Bentoish className={`relative ${width} ${height} `}>

                    <div className=''>

                        {metadata?.animation === ANIMATIONS.angry && <Blinking rate={5800}>
                            <ImageAnimated
                                className=''
                                srcs={['/thinking-meme/ThinkingMeme_eyes.png', '/thinking-meme/ThinkingMeme_eyes_star.png']}
                                rate={3200}
                            />
                        </Blinking>}

                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} className={`${stateClassName['thinking']} ${characterVisible}`} />
                        <Blinking><ImageLayer src={THOUGHT_STATES[state]} /></Blinking>
                        {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} className={`${stateClassName['speaking']} `} />

                        <TextBox
                            text={`${thought}`}
                            className={`absolute leading-[.1em] right-[10%] top-[42%] h-[50%] w-[30%] ${thoughtStyle} ${textStyle} ${showBorder} ${stateClassName['thinking']}`}
                        />

                        <TextBox
                            text={`${said}`}
                            className={`absolute left-[14%] top-[45%] h-[30%] w-[30%] ${speechStyle} ${textStyle} ${showBorder} ${stateClassName['speaking']} ${speechBubbleVisible}`}
                        />


                        {/* <div className='absolute bottom-8 left-20 flex flex-row gap-2'>
                        <p className='text-black'>mood:</p>
                        <p>{emotion}</p>
                    </div> */}

                    </div>


                </Bentoish>

            </div>

            <div className={`w-screen flex justify-center ${scale} mt-[-10em]`}>
                <Bentoish className={`relative w-[22em] h-[22em] `}>
                    <div className=''>
                        {/* {cycles.map((c, i) =>
                            <TextBox
                                text={`${c}`}
                                className={`absolute z-[1000] max-w-[11em] text-sm text-gray-400 ${textStyle} ${showBorder} ${positions[i]} ${i.toString() === cycle && 'underline text-black'}`}
                            />
                        )}
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_cycle.png'} /> */}
                        <Blinking opacity={true}>
                            <ImageLayer src={'/thinking-meme/ThinkingMeme_inputBubble.png'} className={`${stateClassName['speaking']} scale-[1.15]`} />
                        </Blinking>
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_inputHead.png'} className={`scale-[1.15]`} />

                    </div>

                    <Blinking enabled={state === 'waiting'} opacity={true} className={`absolute top-[32%] h-[40%] z-[1000] flex flex-col w-full scale-[1]`}>
                        <InputForm className={`w-[40%] text-sm text-black mx-auto h-full z-[100] ${showBorder}`}>
                            <InputTextArea
                                className={`relative w-full bg-transparent outline-0 border-gray-400 border-none ${speechStyle}`}
                                placeholder={'chat... '}
                                maxLength={75}
                            />
                        </InputForm>
                    </Blinking>

                </Bentoish>
            </div>

            {/* <MessageBox messages={messages} className='min-h-36 p-4 rounded-xl' /> */}

        </>
    )
}

export function ThoughtThinker() {

}

function Bentoish({ className, children }: { className: string, children: React.ReactNode }) {

    const cn = twMerge(``, className); //rounded-xl border-[1px] border-black

    return (
        <div className={cn}>
            {children}
        </div>
    )
}

function TextBox({ text = '', className = '', style = {}, ...props }) {

    const cn = twMerge(`p-1 overflow-clip`, className);
    return (
        <Markdown className={cn} {...props} >
            {text}
        </Markdown>
    )
}   
