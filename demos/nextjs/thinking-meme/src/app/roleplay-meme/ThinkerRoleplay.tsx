"use client"

import React, { use, useEffect, useState } from 'react';
import Badge, { Pulse } from '@/components/Badge';
import { SoulState, useSoulRoom, useSoulSimple, DEFAULT_SOUL_SETTINGS, SoulSimpleProps, SoulProperties, EnvVarProps } from '@/hooks/useSoul';
import { Input } from '@/components/Input';
import { InputTextArea } from '@/components/Messages';
import { ImageLayer, Blinking, ImageAnimated } from '@/components/Graphics';
import { Bentoish, TextBox } from '@/app/thinking-meme/Components';
import Image from 'next/image';

const debug = process.env.NODE_ENV !== 'production';

const SOUL_SETTINGS = {
    organization: 'neilsonnn',
    blueprint: 'thinking-player',
    token: process.env.NEXT_PUBLIC_SOUL_ENGINE_APIKEY,
    debug: debug,
}

export enum ANIMATIONS {
    idle = 'idle',
    gone = 'gone',
    angry = 'angry'
}
export type AnimationType = keyof typeof ANIMATIONS;

export default function ThinkerRoleplay() {

    const [roleplay, setRoleplay] = useState(ROLEPLAYS[Math.floor(Math.random() * ROLEPLAYS.length)]);

    const [subordinate, setSubordinate] = useState<SoulSimpleProps>({
        soulSettings: SOUL_SETTINGS,
        character: {
            name: roleplay[0],
        },
        settings: {
            canSpeak: true,
            canHear: false,
        }
    });

    const [dominant, setDominant] = useState<SoulSimpleProps>({
        soulSettings: SOUL_SETTINGS,
        character: { name: roleplay[1] },
        settings: {
            openInNewTab: false,
        },
    });

    useEffect(() => {
        console.log('Thinking Roleplay');
        setRoleplay(ROLEPLAYS[Math.floor(Math.random() * ROLEPLAYS.length)]);
    }, [])

    return (
        <Thinker
            roleplay={roleplay}
            dominant={dominant}
            subordinate={subordinate}
            setDominant={setDominant}
            setSubordinate={setSubordinate}
            key={subordinate.character.name + dominant.character.name}
        />
    )
}



export function Thinker({ roleplay, dominant, setDominant, subordinate, setSubordinate }: any) {

    const subordinateSoul = useSoulSimple(subordinate);
    const dominantSoul = useSoulSimple(dominant);

    useEffect(() => {

        //update souls with new environment variables
        if (!subordinateSoul || !dominantSoul || !subordinateSoul.soul?.connected || !dominantSoul.soul?.connected) return;

        console.log('subordinate', subordinate.character.name);
        console.log('dominant', dominant.character.name);

        subordinateSoul.setEnvironment((last: EnvVarProps) => ({ ...last, entityName: subordinate.character.name, otherEntityName: dominant.character.name }));
        dominantSoul.setEnvironment((last: EnvVarProps) => ({ ...last, entityName: dominant.character.name, otherEntityName: subordinate.character.name }));

    }, [subordinateSoul?.soul, dominantSoul?.soul, subordinate, dominant])

    return (
        <>
            <div className='flex flex-col align-middle justify-center mt-[5em] gap-4 lg:flex-row lg:w-screen lg:fixed lg:items-center lg:justify-center lg:min-h-screen lg:mt-0'>

                <SpeakerRobot
                    soul={subordinateSoul}
                    otherSoul={dominantSoul}
                    isPlayer={true}
                    role={subordinate.character.name}
                    setRole={(newRole) => setSubordinate((last: any) => ({ ...last, character: { name: newRole } }))}
                />

                <SpeakerRobot
                    soul={dominantSoul}
                    otherSoul={subordinateSoul}
                    isPlayer={false}
                    role={dominant.character.name}
                    setRole={(newRole) => setDominant((last: any) => ({ ...last, character: { name: newRole } }))}
                />

            </div>

            {/* <MessageBox messages={messages} className='min-h-36 p-4 rounded-xl' /> */}

        </>
    )
}

type SpeakerProps = {
    soul: SoulProperties,
    otherSoul: SoulProperties,
    isPlayer?: boolean,
    role: string,
    setRole: (role: string) => void,
}
export function SpeakerRobot({ soul, otherSoul, role, isPlayer = false, setRole }: SpeakerProps) {

    const { messages } = useSoulRoom();

    const [thought, setThought] = useState<string>(``);
    const [said, setSaid] = useState<string>(''); //hey, whats up

    //checks the global messages chat and adds our chats to our text boxes
    useEffect(() => {

        if (messages.length === 0) return;
        const lastMessage = messages[messages.length - 1];

        if (!isPlayer && lastMessage?.character?.name === otherSoul.character.name) {
            setThought('');
            setSaid('');
        } else if (lastMessage?.character?.name === soul.character.name) {
            if (lastMessage.action === 'thinks') {
                setThought(`${lastMessage.content}`) // ${emotion}
            } else if (lastMessage.action === 'says') {
                setSaid(lastMessage.content)
            }
        }

    }, [messages])

    useEffect(() => {

        if (soul.localMessages.length === 0) return;
        const lastMessage = soul.localMessages[soul.localMessages.length - 1];
        // console.log('lastMessage', lastMessage);

        if (lastMessage.action === 'thinks') {
            setThought(lastMessage.content)
        }
    }, [soul, soul?.localMessages])

    const connecting = soul?.soul?.connected ? 'opacity-100' : 'opacity-50 translate-y-[.5em]';

    const textStyle = 'p-2 tracking-tight bg-opacity-100' // border-black border-[1px]
    const speechStyle = 'text-lg tracking-tight text-black font-sans';
    const thoughtStyle = 'text-sm text-gray-400';

    const flip = isPlayer ? 'scale-x-[-1]' : '';
    const selectedStyle = 'underline';
    const width = 'min-w-[26em] w-[26em]' //md:min-w-[40em] md:w-[40em]
    const height = 'min-h-[26em] h-[26em]' //md:min-h-[40em] md:h-[40em]
    const scale = 'scale-[.75] md:scale-[1] md:translate-y-[0%] md:translate-x-[0%]';
    const showBorder = ''//border-[1px] border-red-500';
    const characterVisible = `${soul.metadata?.animation !== 'gone' ? 'opacity-100' : 'opacity-0'}`;
    const speechBubbleVisible = `${soul.metadata?.animation !== 'gone' && soul.metadata?.animation !== 'angry' ? 'opacity-100' : 'opacity-0'}`

    const stateClassName = {
        'waiting': `${soul.state === 'waiting' ? 'opacity-100' : 'opacity-100'}`,
        'processing': `${soul.state === 'processing' ? 'opacity-100' : 'opacity-100'}`,
        'thinking': `${soul.state === 'thinking' ? 'opacity-100' : 'opacity-100'}`,
        'speaking': `${soul.state === 'speaking' ? 'opacity-100' : 'opacity-100'}`,
    }

    return (
        <>
            <div className={`duration-500 flex justify-center ${scale} mt-[-5em] ${connecting}`}>

                <Bentoish className={`relative ${width} ${height} ${flip}`}>
                    <div className=''>
                        {soul.metadata?.animation === ANIMATIONS.angry &&
                            <Blinking rate={5800}>
                                <ImageAnimated
                                    className=''
                                    srcs={['/thinking-meme/ThinkingMeme_eyes.png', '/thinking-meme/ThinkingMeme_eyes_star.png']}
                                    rate={3200}
                                />
                            </Blinking>}

                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'} className={`${stateClassName['thinking']} ${characterVisible}`} />
                        {soul.state === 'thinking' && <ImageAnimated srcs={THINKING_BUBBLES} />}
                        <ImageLayer src={'/thinking-meme/ThinkingMeme_0002s_0000_speech.png'} className={`${stateClassName['speaking']} `} />

                        <div
                            className={`absolute leading-[.1em] right-[13%] top-[44%] h-[50%] w-[26%] ${showBorder} ${stateClassName['thinking']} ${flip}`}>
                            <TextBox
                                className={`relative h-full w-full bg-transparent outline-0 border-gray-400 border-none ${thoughtStyle} ${textStyle} `}
                                text={`${thought}`}
                                placeholder={isPlayer ? 'think...' : ''}
                            // readOnly={!isPlayer}
                            />
                        </div>


                        {isPlayer ? (
                            <>
                                <Blinking enabled={false && soul.state === 'waiting'} opacity={true} className={`absolute left-[14%] top-[45%] h-[30%] w-[30%] z-[1000] flex flex-col scale-[1] ${flip}`}>
                                    <div className={`text-sm text-black mx-auto w-full h-full z-[100] ${showBorder}`}>
                                        <InputTextArea
                                            className={`relative h-full w-full bg-transparent outline-0 border-gray-400 border-none ${speechStyle}`}
                                            character={soul.character}
                                            placeholder={'chat... '}
                                            maxLength={75}
                                        />
                                    </div>
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
                    className='absolute mx-auto bottom-[0%] z-[10000]'
                    value={role}
                    setValue={setRole}
                />

            </div>

        </>
    )
}

export function BadgeFooter() {

    return (
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
    );
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

const ROLEPLAYS = [
    ['founder', 'VC'],
    ['peon', 'barista'],
    ['empty stomach', 'in n out'],
    ['designer', 'figma'],
    ['gamer', 'twitch chat'],
    ['programmer', 'vscode'],
]


