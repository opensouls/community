"use client"

import React, { useState, useEffect, useMemo } from "react"
import { useLocalStorage } from '@uidotdev/usehooks'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Soul, said } from "@opensouls/soul"

export type ActionType = "says" | "thinks" | "does" | "ambience"
export type SoulState = 'waiting' | 'processing' | 'thinking' | 'speaking';

export type CharacterProps = {
    name: string,
    color?: string,
}

export type MessageProps = {
    content: string,
    type: ActionType
    timestamp: number,
    character?: CharacterProps,
}

export const PLAYER_CHARACTER: CharacterProps = { name: 'Interlocutor', color: 'bg-gray-400' }
export const EXAMPLE_MESSAGE: MessageProps = { content: 'HONKKKK!!', type: 'ambience', character: PLAYER_CHARACTER, timestamp: Date.now() };

const startState: MessageProps[] = [];

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
    const [state, setState] = useState<SoulState>('waiting');

    const defaultMessage: MessageProps = useMemo(() => ({
        content: `I (${character.name}) exist.`,
        type: "says",
        character: character,
        timestamp: Date.now(),
    }), [soulID]);

    const [currentWorldState, setCurrentWorldState] = useState<MessageProps>();
    const [talking, setTalking] = useState<boolean>(true);
    const [connected, setConnected] = useState<boolean>(false);
    const [localMessages, setLocalMessages] = useLocalStorage<MessageProps[]>('soul-' + soulID.blueprint, [defaultMessage]);

    const soul = useMemo<Soul>(() => {

        const initSoul = new Soul(soulID);

        initSoul.connect().then(() => {
            console.log("Connected to soul", soulID);
            setConnected(true);
        }).catch((error) => {
            console.error("Error connecting to soul", soulID, error);
        });

        //todo what else to destructure here,
        //should be generic function
        //also shouldn't be inside useMemo?
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
            setState('waiting');

        });

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
            setState('speaking');

        });

        return initSoul;

    }, [soulID, character])

    useEffect(() => {

        setState('processing');

        const timer = setTimeout(() => {

            // console.log('timer');

            if (messages && connected && messages.length > 0) {

                const newMessage = messages[messages.length - 1];
                // console.log('newWorldState', JSON.stringify(newMessage))

                if (newMessage !== currentWorldState && newMessage?.character?.name !== character.name) {

                    // console.log(`${soulID.blueprint}: New world state`, newWorldState);
                    setCurrentWorldState(newMessage);

                    console.log(`${character.name.toUpperCase()} dispatching ${newMessage.content}`);
                    soul.dispatch(said(newMessage?.character?.name ?? 'User', newMessage.content))
                    setState('thinking');

                }
            }

        }, 500);

        return () => clearTimeout(timer);

    }, [messages, character],)

    return { localMessages, state }
}