"use client"

import { useState, useEffect, useMemo } from "react"
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Soul, said, ActionEvent } from "@opensouls/soul"
import { v4 as uuidv4 } from 'uuid';

const ACTIONS = ["says", "thinks", "does", "ambience", "feels", "state"] as const;
export type ActionType = typeof ACTIONS[number];

export type SoulState = 'waiting' | 'processing' | 'thinking' | 'speaking';

export type CharacterProps = {
    name: string,
    color?: string,
}

export type MessageProps = {
    content: string,
    type: ActionType
    character?: CharacterProps,
    timestamp?: number,
    uuid?: string,
}

export const PLAYER_CHARACTER: CharacterProps = { name: 'Interlocutor', color: 'bg-gray-400' }
export const EXAMPLE_MESSAGE: MessageProps = { content: 'HONKKKK!!', type: 'ambience', character: PLAYER_CHARACTER };

const startState: MessageProps[] = [];

interface WorldState {
    messages: MessageProps[];
    addEvent: (newMessage: MessageProps) => void;
    setEvents: (newArray: MessageProps[]) => void;
    setEvent: (index: number, newMessage: MessageProps) => void;
    getEvent: (uuid: string) => [MessageProps | null, number];
}

const handleEvent = (newMessage: MessageProps) => {
    console.log('adding event', JSON.stringify(newMessage));
    const messageWithTimestampAndUUID = {
        ...newMessage,
        timestamp: Date.now(),
        uuid: uuidv4(),
    }
    return messageWithTimestampAndUUID
}

export const useSoulRoom = create<WorldState>()((set, get) => ({
    messages: startState,
    addEvent: (newMessage) => set((state) => {
        const m = handleEvent(newMessage);
        return { messages: [...state.messages, m] }
    }),
    setEvents: (newArray) => set((state) => ({ messages: newArray })),
    setEvent: (index: number, newMessage: MessageProps) => set((state) => {
        const m = state.messages;
        m[index] = newMessage;
        return { messages: m }
    }),
    getEvent: (uuid: string) => {
        const messages = get().messages;
        const index = messages.findIndex((message) => message.uuid === uuid);
        return index !== -1 ? [messages[index], index] : [null, -1];
    }
}))

export type SoulProps = {
    organization: string,
    blueprint: string,
}

export const useSoulSimple = ({ soulID, character }: { soulID: SoulProps, character: CharacterProps }) => {

    const { messages, addEvent, setEvent, getEvent } = useSoulRoom();
    const [state, setState] = useState<SoulState>('waiting');

    const defaultMessage: MessageProps = useMemo(() => ({
        content: `I (${character.name}) exist.`,
        type: "says",
        character: character,
        timestamp: Date.now(),
    }), [soulID]);

    const [soul, setSoul] = useState<Soul>();

    const [currentWorldState, setCurrentWorldState] = useState<MessageProps>();
    const [talking, setTalking] = useState<boolean>(true);
    const [connected, setConnected] = useState<boolean>(false);
    const [localMessages, setLocalMessages] = useState<MessageProps[]>([defaultMessage]);

    useEffect(() => {

        const initSoul = new Soul(soulID);
        setSoul(initSoul);

        initSoul.connect().then(() => {
            console.log("Connected to soul", soulID);
            setConnected(true);
        }).catch((error) => {
            console.error("Error connecting to soul", soulID, error);
        });

        //todo what else to destructure here,
        //should be generic function
        //also shouldn't be inside useMemo?

        //not working atm

        const onEvent = (stream = false, local = false) => async (event: ActionEvent) => {

            let value = '';

            if (!stream) {
                console.log(event.name, event.action, value, 'not streaming')
                value = await event.content();
            }

            if (event.action === 'thinks') {
                setState('speaking');
            } else if (event.action === 'says') {
                setState('waiting');
            } else {
                setState('thinking');
            }

            console.log(event.name, event.action, value);
            const message = createEvent(event, value);
            let index = -1;

            if (local) {
                setLocalMessages(last => {
                    index = last.length;
                    return [...last, message]
                });
            } else {
                addEvent(message);
            }

            if (stream) {

                console.log(event.name, event.action, value, 'streaming');
                for await (const txt of event.stream()) {
                    // console.log(event.action, txt);
                    const index = message.uuid ? getEvent(message.uuid)[1] : -1;
                    if(index === -1) {console.error('could not find message in messages');}
                    setEvent(index, { ...message, content: (message.content + txt).trim() });
                    // setLocalMessages(last => {
                    //     last[index].content = (last[index].content + txt).trim()
                    //     console.log(last[index].content);
                    //     return last;
                    // });
                }
                console.log(event.name, event.action, value, 'streaming done');
            }
        }

        function createEvent(event: ActionEvent, content: string) {
            const message: MessageProps = {
                content: content,
                type: event.action as ActionType,
                character: character,
                timestamp: Date.now(),
                uuid: uuidv4(),
            }

            return message;
        }

        const eventHandlers = ACTIONS.reduce((acc, action) => {
            acc[action] = async (evt) => await onEvent()(evt);
            return acc;
        }, {} as Record<ActionType, (evt: ActionEvent) => Promise<void>>);

        ACTIONS.forEach(action => {
            initSoul.on(action, eventHandlers[action]);
        });

        return () => {
            ACTIONS.forEach(action => {
                initSoul.off(action, eventHandlers[action]);
            });
        };

    }, [soulID, character])

    useEffect(() => {

        if (!soul) { return }

        let timer = null

        if (messages && connected && messages.length > 0) {

            const newMessage = messages[messages.length - 1];
            // console.log('newWorldState', JSON.stringify(newMessage))

            if (newMessage !== currentWorldState && newMessage?.character?.name !== character.name) {
                setState('processing');

                timer = setTimeout(() => {

                    // console.log('timer');
                    // console.log(`${soulID.blueprint}: New world state`, newWorldState);

                    setCurrentWorldState(newMessage);

                    console.log(`${character.name.toUpperCase()} dispatching ${newMessage.content}`);
                    soul.dispatch(said(newMessage?.character?.name ?? 'User', newMessage.content))
                    setState('thinking');

                }, 500);
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        }

    }, [soul, messages, character],)

    return { localMessages, state }
}