"use client"

import React, { useEffect, useState } from 'react';
import Badge, { Pulse } from '@/components/Badge';
import { SoulState, useSoulRoom, useSoulSimple, PLAYER_CHARACTER, SoulProps, CharacterProps } from '@/hooks/useSoulRoom';
import { Input } from '@/components/Input';
import { InputForm, InputTextArea } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { Bentoish, TextBox } from '@/app/thinking-meme/Components';
import { twMerge } from 'tailwind-merge';
import Image from 'next/image';

import { Soul } from '@opensouls/soul';
import { Footer } from '../components/Elements';

const thinkingSoul = {
    name: 'overthinker',
}

console.log("API", process.env.NEXT_PUBLIC_SOUL_APIKEY);
const debug = process.env.NODE_ENV !== 'production';

const playerSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-player',
    token: process.env.NEXT_PUBLIC_SOUL_APIKEY,
    debug: debug,
}

const thinkingSoulID = {
    organization: 'neilsonnn',
    blueprint: 'thinking-meme',
    token: process.env.NEXT_PUBLIC_SOUL_APIKEY,
    debug: debug,
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

export default function ThinkerRoleplay() {

    return (
        <>
            <div className='flex flex-col align-middle justify-center mt-[5em] gap-4 lg:flex-row lg:w-screen lg:fixed lg:items-center lg:justify-center lg:min-h-screen lg:mt-0'>

                <SpeakerRobot
                    soulID={playerSoulID}
                    character={PLAYER_CHARACTER}
                    isPlayer={true}
                    roleplay={'VC'}
                />

                <SpeakerRobot
                    soulID={thinkingSoulID}
                    character={thinkingSoul}
                    roleplay={'founder'}
                />

            </div>

            {/* <MessageBox messages={messages} className='min-h-36 p-4 rounded-xl' /> */}
            <div className='mx-auto mt-12 flex flex-col align-middle items-center lg:bottom lg:w-screen lg:flex-row lg:justify-between lg:px-8 lg:bottom-4 lg:absolute '>

                <a href={'https://github.com/opensouls/community'} target='_blank' className=''>
                    <Badge className=''>
                        <Pulse />
                        {'thinking-roleplay'}
                    </Badge>
                </a>
                <a href='https://www.opensouls.studio/' target='_blank' className="w-[8em] mt-[-.5em]">
                    <Image src='/logo.png' alt='OpenSouls logo' width={100} height={100} className='color-black text-black mx-auto opacity-50' />
                </a>
            </div>
        </>
    )
}

type SpeakerProps = {
    soulID: SoulProps,
    character: CharacterProps,
    isPlayer?: boolean,
}
export function SpeakerRobot({ soulID, character, roleplay, isPlayer = false }: SpeakerProps & { roleplay: string }) {

    const { messages } = useSoulRoom();
    const { localMessages, state, metadata, sendPerception } = useSoulSimple({ 
        soulSettings: soulID, 
        character: character,
    });

    const [thought, setThought] = useState<string>(``);
    const [said, setSaid] = useState<string>(''); //hey, whats up

    const [role, setRole] = useState<string>(roleplay); //idle, thinking, speaking, waiting

    //checks the global messages chat and adds our chats to our text boxes
    useEffect(() => {

        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.character?.name !== character.name) return;
        if (lastMessage?.character?.name === PLAYER_CHARACTER.name) {
            setThought('');
            setSaid('');
        } else if (lastMessage.type === 'thinks') {
            setThought(`${lastMessage.content}`) // ${emotion}
        } else if (lastMessage.type === 'says') {
            setSaid(lastMessage.content)
        } 

    }, [messages])

    useEffect(() => {

        if (localMessages.length === 0) return;
        const lastMessage = localMessages[localMessages.length - 1];
        // console.log('lastMessage', lastMessage);

        if (lastMessage.type === 'thinks') {
            setThought(lastMessage.content)
        }
    }, [localMessages])

    const textStyle = 'p-2 tracking-tight bg-opacity-100' // border-black border-[1px]
    const speechStyle = 'text-lg text-black font-sans';
    const thoughtStyle = 'text-sm text-gray-400';

    const flip = isPlayer ? 'scale-x-[-1]' : '';
    const selectedStyle = 'underline';
    const width = 'min-w-[26em] w-[26em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[26em] h-[26em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'scale-[.75] md:scale-[1] md:translate-y-[0%] md:translate-x-[0%]'
    const showBorder = ''//border-[1px] border-red-500'
    const characterVisible = `${metadata?.animation !== 'gone' ? 'opacity-100' : 'opacity-0'}`
    const speechBubbleVisible = `${metadata?.animation !== 'gone' && metadata?.animation !== 'angry' ? 'opacity-100' : 'opacity-0'}`

    const stateClassName = {
        'waiting': `${state === 'waiting' ? 'opacity-100' : 'opacity-100'}`,
        'processing': `${state === 'processing' ? 'opacity-100' : 'opacity-100'}`,
        'thinking': `${state === 'thinking' ? 'opacity-100' : 'opacity-100'}`,
        'speaking': `${state === 'speaking' ? 'opacity-100' : 'opacity-100'}`,
    }

    return (
        <>
            <div className={`w-screen flex justify-center ${scale} mt-[-5em]`}>

                <Bentoish className={`relative ${width} ${height} ${flip}`}>
                    <div className=''>
                        {metadata?.animation === ANIMATIONS.angry && <Blinking rate={5800}>
                            <ImageAnimated
                                className=''
                                srcs={['/thinking-meme/ThinkingMeme_eyes.png', '/thinking-meme/ThinkingMeme_eyes_star.png']}
                                rate={3200}
                            />
                        </Blinking>}

                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} className={`${stateClassName['thinking']} ${characterVisible}`} />
                        {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} className={`${stateClassName['speaking']} `} />

                        <TextBox
                            text={`${thought}`}
                            className={`absolute leading-[.1em] right-[10%] top-[42%] h-[50%] w-[30%] ${thoughtStyle} ${textStyle} ${showBorder} ${stateClassName['thinking']} ${flip}`}
                        />


                        {isPlayer ? (
                            <>
                                <Blinking enabled={state === 'waiting'} opacity={true} className={`absolute left-[14%] top-[45%] h-[30%] w-[30%] z-[1000] flex flex-col scale-[1] ${flip}`}>
                                    <InputForm className={`text-sm text-black mx-auto w-full h-full z-[100] ${showBorder}`}>
                                        <InputTextArea
                                            className={`relative w-full bg-transparent outline-0 border-gray-400 border-none ${speechStyle}`}
                                            character={character}
                                            placeholder={'chat... '}
                                            maxLength={75}
                                        />
                                    </InputForm>
                                </Blinking>
                            </>

                        ) : (
                            <>
                                <TextBox
                                    text={`${said}`}
                                    className={`absolute border-green-500 left-[14%] top-[45%] h-[30%] w-[30%] ${speechStyle} ${textStyle} ${showBorder} ${stateClassName['speaking']} ${speechBubbleVisible}`}
                                />
                            </>

                        )}

                    </div>
                </Bentoish>

                <Input
                    className='absolute mx-auto bottom-[0%]'
                    value={role}
                    setValue={setRole}
                />

            </div>

        </>
    )
}


export function SpeechHead() {

}

export function SpeechBubble() {

}

