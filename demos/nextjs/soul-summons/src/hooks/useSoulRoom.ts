"use client"

import { useState, useEffect, useMemo } from "react"
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { Soul, said, ActionEvent } from "@opensouls/soul"
import { v4 as uuidv4 } from 'uuid';

const ACTIONS = ["says", "thinks", "does", "ambience", "feels", "state"] as const;
export type ActionType = typeof ACTIONS[number];
export type SoulState = 'waiting' | 'processing' | 'thinking' | 'speaking';

export type SoulProps = {
    organization: string,
    blueprint: string,
}

export type CharacterProps = {
    name: string,
    color?: string,
}

export type MessageProps = {
    content: string,
    type: ActionType
    character?: CharacterProps,
    metadata?: any,
    _timestamp?: number,
    _uuid?: string,
    event?: ActionEvent,
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
    const messageWithTimestampAndUUID = {
        ...newMessage,
        timestamp: newMessage._timestamp ?? Date.now(),
        uuid: newMessage._uuid ?? uuidv4(),
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
        const messages = [...state.messages];
        messages[index] = newMessage;
        return { messages };
    }),
    getEvent: (uuid: string) => {
        //todo make a record w/ uuid
        const messages = get().messages;
        const index = messages.findIndex((m) => m._uuid === uuid);
        if (index === -1) { return [null, -1]; }
        return [messages[index], index];
    }

}))

export const useSoulSimple = ({ soulID, character }: { soulID: SoulProps, character: CharacterProps }) => {

    const { messages, addEvent, setEvent, getEvent } = useSoulRoom();
    const [state, setState] = useState<SoulState>('waiting');
    const [metadata, setMetadata] = useState<any>({});

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
            console.log("Connected to soul", soulID.blueprint);
            setConnected(true);
        }).catch((error) => {
            console.error("Error connecting to soul", soulID, error);
        });

        const onEvent = (stream = false, local = false) => async (event: ActionEvent) => {

            let value = '';

            if (!stream) {
                console.log(event.name, event.action, value, 'not streaming')
                value = await event.content();
            }

            setMetadata(event._metadata);


            if (event._metadata && event._metadata.state) {
                const state = event._metadata.state;
                console.log('STATE_OVERRIDE', state)
                if (state as SoulState !== state) { console.error('state mismatch') }
                setState(state as SoulState);
            } else if (event.action === 'thinks') {
                setState('speaking');
            } else if (event.action === 'says') {
                setState('waiting');
            } else {
                setState('thinking');
            }

            console.log(event.name, event.action, value);
            const message = ingestAction(event, value);
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
                    if (message._uuid === undefined) { return; }
                    const [m, index] = getEvent(message._uuid);
                    if (m === undefined) { console.error('could not find message in messages'); }
                    message.content = (message.content + txt).trim();
                    setEvent(index, message);

                    // setLocalMessages(last => {
                    //     last[index].content = (last[index].content + txt).trim()
                    //     console.log(last[index].content);
                    //     return last;
                    // });
                }

                console.log(event.name, event.action, value, 'streaming done');
            }
        }

        function ingestAction(event: ActionEvent, content: string) {

            const message: MessageProps = {
                ...event,
                content: content,
                type: event.action as ActionType,
                character: character,
                metadata: event._metadata,
                event: event,
                _timestamp: event._timestamp,
                _uuid: uuidv4(),
            }

            return message;
        }

        const eventHandlers = ACTIONS.reduce((acc, action) => {
            acc[action] = async (evt) => await onEvent(false, false)(evt);
            return acc;
        }, {} as Record<ActionType, (evt: ActionEvent) => Promise<void>>);

        ACTIONS.forEach(action => {
            initSoul.on(action, eventHandlers[action]);
        });

        return () => {
            ACTIONS.forEach(action => {
                initSoul.off(action, eventHandlers[action]);
            });
            console.log('disconnecting soul', soulID.blueprint);
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
                    soul.dispatch(said(newMessage?.character?.name ?? 'Interlocutor', newMessage.content))
                    setState('thinking');

                }, 500);
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        }

    }, [soul, messages, character],)

    return { localMessages, state, metadata }
}