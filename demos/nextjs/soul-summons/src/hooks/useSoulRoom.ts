"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useLocalStorage } from '@uidotdev/usehooks'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Soul, said } from "@opensouls/soul"

export type ActionTypes = "says" | "thinks" | "does" | "ambience"
export type SoulStates = 'waiting' | 'thinking' | 'speaking' | 'having-regrets';

export type CharacterProps = {
    name: string,
    color?: string,
}

export type MessageProps = {
    content: string,
    type: ActionTypes
    timestamp: number,
    character?: CharacterProps,
}

export const worldCharacter: CharacterProps = { name: 'world', color: 'bg-black' }

const startState: MessageProps[] = [{
    content: 'A windy knoll. The room hums. Dice, clock, and puddle are in a meeting.',
    type: 'thinks',
    character: worldCharacter,
    timestamp: Date.now(),
}];

interface WorldState {
    messages: MessageProps[]
    addEvent: (newMessage: MessageProps) => void
    setEvents: (newArray: MessageProps[]) => void
}

const handleEvent = (newMessage: MessageProps) => {
    console.log('adding event', JSON.stringify(newMessage));
    return newMessage
}

export const useSoulRoom = create<WorldState>()(
    devtools(
        persist(
            (set) => ({
                messages: startState,
                addEvent: (newMessage) => set((state) => {
                    handleEvent(newMessage);
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

export type SoulProps = {
    organization: string,
    blueprint: string,
}

export const useSoulSimple = ({ soulID, character }: { soulID: SoulProps, character: CharacterProps }) => {

    const { messages, addEvent } = useSoulRoom();
    const [state, setState] = useState<SoulStates>('waiting');

    const defaultMessage: MessageProps = useMemo(() => ({
        content: `I (${character.name}) exist.`,
        type: "says",
        character: character,
        timestamp: Date.now(),
    }), [soulID]);

    const [currentWorldState, setCurrentWorldState] = useState<MessageProps>();
    const [thinking, setThinking] = useState<boolean>(false);
    const [talking, setTalking] = useState<boolean>(true);
    const [connected, setConnected] = useState<boolean>(false);
    const [localMessages, setLocalMessages] = useLocalStorage<MessageProps[]>('soul-' + soulID.blueprint, [defaultMessage]);

    const soul = useMemo<Soul>(() => {

        const initSoul = new Soul(soulID);

        initSoul.connect().then(() => {
            // console.log("Connected to soul", soulID);
            setConnected(true);
        }).catch((error) => {
            console.error("Error connecting to soul", soulID, error);
        });

        //todo what else to destructure here,
        //should be generic function
        //also shouldn't be inside useMemo
        initSoul.on("says", async ({ content }) => {

            const newContent = await content();
            console.log("Soul said", newContent);

            const messageProp: MessageProps = {
                content: newContent,
                type: "says",
                character: character,
                timestamp: Date.now(),
            }

            // setMessages([...messages, messageProp]);
            addEvent(messageProp);
            setThinking(false);

        });

        //todo what else to destructure here
        initSoul.on('thinks', async ({ content }) => {

            const newContent = await content();
            console.log("Soul thinks", newContent);

            const messageProp: MessageProps = {
                content: newContent,
                type: "thinks",
                character: character,
                timestamp: Date.now(),
            }

            //only add message internally
            setLocalMessages([...localMessages, messageProp]);
            setThinking(false);

        });

        return initSoul;

    }, [soulID, character])

    useEffect(() => {

        const timer = setTimeout(() => {

            // console.log('timer');

            if (messages && connected && messages.length > 0) {

                const newMessage = messages[messages.length - 1];
                // console.log('newWorldState', JSON.stringify(newMessage))

                if (newMessage !== currentWorldState && newMessage?.character?.name !== character.name) {

                    // console.log(`${soulID.blueprint}: New world state`, newWorldState);
                    setCurrentWorldState(newMessage);
                    setThinking(true);

                    console.log(`${character.name.toUpperCase()} dispatching ${newMessage.content}`);
                    soul.dispatch(said(newMessage?.character?.name ?? 'User', newMessage.content))

                }
            }

        }, 2000);

        return () => clearTimeout(timer);

    }, [messages, character],)

    return { state, localMessages }
}