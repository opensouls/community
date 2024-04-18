"use client"

import React, { useEffect, useState } from 'react';
import { SoulState, useSoulRoom, useSoulSimple, PLAYER_CHARACTER, SoulProps } from '@/hooks/useSoulRoom';
import { Input as InputLabel } from '@/components/Input';
import { InputForm, Input, InputTextArea } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { Bentoish, TextBox } from '@/app/thinking-meme/Components';
import { v5 as uuidv5 } from 'uuid';
import { v4 as uuidv4 } from 'uuid';
import getAssetPath from "@/lib/assets";

import { Footer } from '../components/Elements';

const debug = process.env.NODE_ENV !== 'production';

const thinkingSoulID = {
    organization: process.env.NEXT_PUBLIC_SOUL_ENGINE_ORGANIZATION as string,
    blueprint: process.env.NEXT_PUBLIC_SOUL_ENGINE_BLUEPRINT as string,
    soulId: uuidv4(),
    token: process.env.NEXT_PUBLIC_SOUL_ENGINE_APIKEY,
    debug: debug,
}

const roomVar = {scenario: 'storming of the bastille',}
const soulVar = { entityName: 'Johnathan',}
const character = {name: 'overthinker',}


export default function Thinker() {

    const [soulSettings, setSoulSettings] = useState<SoulProps>(thinkingSoulID);
    const { room, setRoom } = useSoulRoom();

    // TODO set soulVar somewhere else
    useEffect(() => {

        let newRoom = room;

        if (room?.scenario === undefined) {

            newRoom = {
                ...roomVar,
                ...soulVar,
                scenario: scenarios[Math.floor(Math.random() * scenarios.length)],
            };

            setRoom(newRoom);
        }

        // console.log('INIT ROOM:', room.scenario);

        setSoulSettings({
            ...thinkingSoulID,
            soulId: uuidv4(),
        });

    }, [])

    useEffect(() => {

        if(room?.scenario === undefined) return;

        //if you want static rooms to return to based on scenario
        //soulId: uuidv5(room.scenario, uuidv5.URL)

        // console.log('NEW ROOM', room.scenario);
        setSoulSettings({
            ...thinkingSoulID,
            soulId: uuidv4(),
        });
    }, [room])


    return (
        <>
            {room?.scenario !== undefined && <SoulThinker
                soulSettings={soulSettings}
                // key={soulSettings.soulId}
            />}
        </>
    )
}

function SoulThinker({ soulSettings }: { soulSettings: SoulProps }) {

    const [thought, setThought] = useState<string>(``);
    const [said, setSaid] = useState<string>(''); //hey, whats up
    const [emotion, setEmotion] = useState<string>('😐');
    const [cycle, setCycle] = useState<string>('0');

    const { messages, room, setRoom } = useSoulRoom();
    const { localMessages, state, metadata, } = useSoulSimple({ soulSettings: soulSettings, character: character });

    //do some filtering
    useEffect(() => {

        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];

        if (lastMessage?.character?.name === PLAYER_CHARACTER.name) {
            setThought('');
            setSaid('');
        } else {
            if (lastMessage.type === 'thinks') {
                setThought(`${lastMessage.content}`) // ${emotion}
            } else if (lastMessage.type === 'says') {
                setSaid(lastMessage.content)
            } else if (lastMessage.type === 'feels') {
                setEmotion(lastMessage.content)
            }

            if (lastMessage?.metadata?.cycle !== undefined) {
                setCycle(lastMessage.metadata.cycle)
            }
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

    const canInput = (metadata?.canSpeak === undefined) || metadata.canSpeak === true;

    const textStyle = 'p-2 tracking-tight bg-opacity-100' // border-black border-[1px]
    const speechStyle = 'text-lg text-black font-sans';
    const thoughtStyle = `${state === 'thinking' ? 'opacity-0' : 'opacity-100'} text-sm text-gray-400`;

    const inputStyle = canInput ? 'opacity-100' : 'opacity-25';
    const hiddenWhenInputDisabled = canInput ? 'opacity-100' : 'opacity-0';

    const selectedStyle = 'underline';
    const width = 'min-w-[30em] w-[30em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[30em] h-[30em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'scale-[.75] md:scale-[1] md:translate-y-[0%] md:translate-x-[0%]'
    const showDebug = '' //border-[1px] border-red-500'

    const characterVisible = `${metadata?.animation !== 'gone' ? 'opacity-100' : 'opacity-0'}`

    return (
        <div className='flex flex-col align-middle justify-center min-h-screen gap-4 '>

            <div className='flex flex-col align-middle items-center gap-2'>
                <p className='text-xl'>
                    {'millenial simulator'}
                </p>
                <InputLabel
                    className='mx-auto text-md w-[20em] z-[1000] opacity-50 hover:opacity-75'
                    value={room?.scenario || ''}
                    setValue={(s) => setRoom({ ...room, scenario: s })}
                    maxLength={50}
                    placeholder={'enter a scenario...'}
                />
            </div>


            <div className={`w-screen flex justify-center ${scale} mt-[-4em] md:mt-[-1em] z-[2000]`}>
                <Bentoish className={`relative w-[22em] h-[22em] ${inputStyle}`}>
                    <div className=''>

                        <Blinking opacity={true} enabled={state === 'waiting' && canInput}>
                            <ImageLayer src={getAssetPath('/thinking-meme/ThinkingMeme_inputBubble.png')} className={`scale-[1.15]`} />
                        </Blinking>
                        <ImageLayer src={getAssetPath('/thinking-meme/ThinkingMeme_inputHead.png')} className={`scale-[1.15]`} />

                    </div>

                    <Blinking enabled={state === 'waiting' && canInput} opacity={true} className={`absolute top-[32%] h-[40%] z-[2000] flex flex-col w-full scale-[1]`}>
                        <InputForm className={`w-[40%] text-sm text-black mx-auto h-full ${showDebug}`}>
                            <InputTextArea
                                className={`relative w-full bg-transparent outline-0 border-gray-400 border-none ${speechStyle}`}
                                placeholder={'roleplay... '}
                                maxLength={75}
                                disabled={!canInput}
                            />
                        </InputForm>
                    </Blinking>

                </Bentoish>
            </div>

            <div className={`w-screen flex justify-center ${scale} mt-[-19em] md:mt-[-16em] z-[0]`}>
                <Bentoish className={`relative ${width} ${height} `}>

                    <div className=''>

                        {metadata?.animation === ANIMATIONS.angry && <Blinking rate={5800}>
                            <ImageAnimated
                                className=''
                                srcs={[getAssetPath('/thinking-meme/ThinkingMeme_eyes.png'), getAssetPath('/thinking-meme/ThinkingMeme_eyes_star.png')]}
                                rate={3200}
                            />
                        </Blinking>}

                        <ImageLayer src={getAssetPath('/thinking-meme/ThinkingMeme_0002s_0001_head.png')} className={`${characterVisible}`} />
                        <Blinking><ImageLayer src={getAssetPath(getThoughtState(state))} className={hiddenWhenInputDisabled} /></Blinking>
                        {state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}
                        <ImageLayer src={getAssetPath('/thinking-meme/ThinkingMeme_0002s_0000_speech.png')} className={`${inputStyle}`} />

                        <TextBox
                            text={`${thought}`}
                            className={`absolute leading-[.1em] right-[10%] top-[42%] h-[50%] w-[30%] ${thoughtStyle} ${textStyle} ${showDebug}`} />

                        <TextBox
                            text={`${said}`}
                            className={`absolute left-[14%] top-[45%] h-[30%] w-[30%] ${speechStyle} ${textStyle} ${showDebug} ${inputStyle}`}
                        />


                        {/* <div className='absolute bottom-8 left-20 flex flex-row gap-2'>
                        <p className='text-black'>mood:</p>
                        <p>{emotion}</p>
                    </div> */}

                        {showDebug && <div className='absolute'>
                            <ul>
                                <li><b>METADATA:</b>{JSON.stringify(metadata, null, 2)}</li>
                                <li><b>STATE:</b>{state}</li>
                            </ul>
                        </div>}

                    </div>


                </Bentoish>

            </div>


            {/* <MessageBox messages={messages} className='min-h-36 p-4 rounded-xl' /> */}

            {/* <Footer /> */}

        </div>
    )
}

export enum ANIMATIONS {
    idle = 'idle',
    gone = 'gone',
    angry = 'angry'
}
export type AnimationType = keyof typeof ANIMATIONS;

const getThoughtState = (state: SoulState) => {
    return THOUGHT_STATES[state] ?? '';
}
const THOUGHT_STATES: Record<SoulState, string> = {
    'waiting': '/thinking-meme/ThinkingMeme_reply.png',
    'processing': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
    'thinking': '/thinking-meme/ThinkingMeme_0000s_0000_enterHead.png',
    'speaking': '/thinking-meme/ThinkingMeme_0000s_0001_exitHead.png',
}
const THINKING_BUBBLES = [
    getAssetPath('/thinking-meme/ThinkingMeme_0001s_0000_thought1.png'),
    getAssetPath('/thinking-meme/ThinkingMeme_0001s_0001_thought3.png'),
    getAssetPath('/thinking-meme/ThinkingMeme_0001s_0002_thought2.png'),
]

export const scenarios = [
    'kidnapping dogs at the local park',
    'storming the bastille',
    'putting someone in the friendzone',
    'confessing to your minecraft crush',
    'getting denied entry to berghain',
    'sports betting on lichess bullet games'
]