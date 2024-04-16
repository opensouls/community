"use client"

import React, { useState, useEffect } from "react"
import SoulVoice from "@/components/Soul"
import { Label, Sprite } from "@/components/Graphics"
import { MessageProps, CharacterProps } from "@/hooks/useSoulRoom"
import { Input, InputForm, MessageWaterfall } from "../../components/Messages"
import { CharacterBox } from "./Layout"
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'


const hornCharacter: CharacterProps = { name: 'horn', color: 'bg-red-500' }
const worldCharacter: CharacterProps = { name: 'world', color: 'bg-black' }
const clockCharacter: CharacterProps = { name: 'clock', color: 'bg-yellow-500' }
const diceCharacter: CharacterProps = { name: 'dice', color: 'bg-blue-500' }
const puddleCharacter: CharacterProps = { name: 'puddle', color: 'bg-green-500' }

const startState: MessageProps[] = [{
    content: 'A windy knoll. The room hums. Dice, clock, and puddle are in a meeting.',
    type: 'thinks',
    character: worldCharacter,
}];

interface WorldState {
    messages: MessageProps[]
    addEvent: (newMessage: MessageProps) => void
    setEvents: (newArray: MessageProps[]) => void
}

const addEvent = (newMessage: MessageProps) => {
    console.log('adding event', JSON.stringify(newMessage));
    return newMessage
}

export const useUniverseStore = create<WorldState>()(
    devtools(
        persist(
            (set) => ({
                messages: startState,

                addEvent: (newMessage) => set((state) => {
                    addEvent(newMessage);
                    return { messages: [...state.messages, newMessage] }
                }),
                setEvents: (newArray) => set((state) => ({ messages: newArray })),
            }),
            {
                name: 'universe',
            },
        ),
    ),
)

export default function Desk({ }) {

    const { messages, addEvent } = useUniverseStore();

    function onClick() {
        addEvent({ content: 'Honk.', type: 'ambience', character: hornCharacter});
    }

    return (
        <>
            <div className="absolute w-screen h-screen inset-0 bg-transparent flex">

                <div className="p-8 flex gap-8">

                    <div className="flex flex-col w-max-sm gap-2 content-end font-mono text-sm text-[#444] ">

                        <br />
                        <br />

                        <div className="flex flex-col gap-4">

                            <MessageWaterfall messages={messages} className={'flex grow-1 h-[50em]'} />

                            <hr className="border-gray-400" />

                            <InputForm>
                                <Input />
                            </InputForm>

                            <button
                                className="border-[1px] bg-white border-black w-min px-4 hover:bg-black hover:text-white"
                                onClick={onClick}
                            >
                                honk
                            </button>

                            <button
                                className="border-[1px] bg-white border-black w-min px-4 hover:bg-black hover:text-white"
                                onClick={() => localStorage.clear()}
                            >
                                reset
                            </button>

                        </div>

                    </div>

                    <CharacterBox>
                        <div className="flex flex-col align-middle justify-center">
                            <Sprite src={'/sprites/handclock.png'} />
                            <div className="flex absolute m-auto">
                                <Sprite src={'/sprites/clockhand.png'} />
                            </div>
                        </div>
                        <Label>
                            clock
                        </Label>
                        <SoulVoice
                            soulID={{
                                organization: "neilsonnn",
                                blueprint: "shy",
                            }}
                            character={clockCharacter}
                        />
                    </CharacterBox>

                    <CharacterBox>
                        <div className="flex flex-col align-middle justify-center">
                            <Sprite src={'/sprites/puddle.png'} />
                        </div>
                        <Label>
                            puddle
                        </Label>
                        <SoulVoice
                            soulID={{
                                organization: "neilsonnn",
                                blueprint: "multi-texting",
                            }}
                            character={puddleCharacter}
                        />
                    </CharacterBox>

                    <CharacterBox>
                        <div className="flex flex-col align-middle justify-center">
                            <Sprite src={'/sprites/dice.png'} />
                        </div>
                        <Label>
                            dice
                        </Label>
                        <SoulVoice
                            soulID={{
                                organization: "neilsonnn",
                                blueprint: "dice",
                            }}
                            character={diceCharacter}
                        />

                    </CharacterBox>

                    {/* <CharacterBox>
                    <SoulVoice
                        soulID={{
                            organization: "neilsonnn",
                            blueprint: "shy",
                        }}
                    >
                    </SoulVoice>
                    <div className="flex flex-col align-middle justify-center">
                        <Sprite src={'/sprites/vagrant.png'} />
                    </div>
                    <Label>
                        sophist
                    </Label>
                </CharacterBox> */}



                </div>

            </div>



        </>
    )
}


