"use client"

import { useState, useEffect, useMemo } from "react"
import { create } from 'zustand'
import { Soul, said, ActionEvent } from "@opensouls/soul"
import { v4 as uuidv4 } from 'uuid';
import { SoulEvent } from "@opensouls/engine"

const ACTIONS = ["says", "thinks", "does", "ambience", "feels", "metadata"] as const;
export type ActionType = typeof ACTIONS[number];
export type SoulState = 'waiting' | 'processing' | 'thinking' | 'speaking' ;

export type SoulProps = {
    organization: string,
    blueprint: string,
    soulId?: string,
    environment?: Record<string, any>,
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

export type SoulSettings = {
    canHear: boolean,
    canSpeak: boolean,
}

export const PLAYER_CHARACTER: CharacterProps = { name: 'Interlocutor', color: 'bg-gray-400' }
export const EXAMPLE_MESSAGE: MessageProps = { content: 'HONKKKK!!', type: 'ambience', character: PLAYER_CHARACTER };

interface WorldState {
    messages: MessageProps[];
    room: Record<string, any>;
    setRoom: (newRoom: Record<string, any>) => void;
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
    messages: [],
    room: {},
    setRoom: (newRoom) => set((state) => ({ room: newRoom })),
    addEvent: (newMessage) => set((state) => {
        const messages = state.messages;
        if (newMessage.content === '') { console.error('no content'); return { ...messages }; }
        const m = handleEvent(newMessage);
        return { messages: [...messages, m] }
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

type SoulSimpleProps = {
    soulSettings: SoulProps,
    character: CharacterProps,
    environment?: Record<string, any>,
    settings?: SoulSettings,
}

export const useSoulSimple = ({
    soulSettings,
    character,
    environment,
    settings = {
        canHear: true,
        canSpeak: true,
    }
}: SoulSimpleProps) => {

    const { messages, room, addEvent, setEvent, getEvent } = useSoulRoom();
    const [state, setState] = useState<SoulState>('waiting');
    const [metadata, setMetadata] = useState<SoulEvent['_metadata']>({});

    const defaultMessage: MessageProps = useMemo(() => ({
        content: `I (${character.name}) exist.`,
        type: "says",
        character: character,
        timestamp: Date.now(),
    }), [soulSettings]);

    const [soul, setSoul] = useState<Soul>();

    const [connected, setConnected] = useState<boolean>(false);
    const [localRoomState, setLocalRoomState] = useState<MessageProps>();
    const [localMessages, setLocalMessages] = useState<MessageProps[]>([defaultMessage]);

    useEffect(() => {

        const initSoul = new Soul(soulSettings);

        // console.log("initSoul", soulSettings.blueprint, soulSettings.soulId);

        initSoul.connect().then(() => {
            // console.log("Connected to soul", soulSettings.blueprint);
            setConnected(true);
            setSoul(initSoul);
        }).catch((error) => {
            console.error("Error connecting to soul", soulSettings, error);
        });

        const onEvent = (stream = false, local = false) => async (event: ActionEvent) => {

            let value = '';

            if (!stream) {
                // console.log(event.name, event.action, value, 'not streaming')
                value = await event.content();
            }

            setMetadata((last) => ({ ...last, ...event._metadata }));

            if (event.action === 'metadata') {
                if (event?._metadata === undefined) {
                    console.error('metadata undefined', JSON.stringify(event, null, 2))
                    return;
                }
                const state = event._metadata.state;
                // console.log('STATE_OVERRIDE', state)
                if (state as SoulState !== state) { console.error('state mismatch') }
                setState(state as SoulState);
            } else if (event.action === 'thinks') {
                setState('speaking');
            } else if (event.action === 'says') {
                setState('waiting');
            } else {
                setState('thinking');
            }

            // console.log(event.name, event.action, value);
            const message = ingestAction(event, value);
            let index = -1;

            //eventually add this as a `useSoulStore` that the room and the souls both use
            //local messages are only added to our store 
            //speaking and other actions get added to the room store

            if (local) {
                //rework local soon
                setLocalMessages(last => {
                    index = last.length;
                    return [...last, message]
                });
            } else {
                if (settings.canSpeak) {
                    addEvent(message);
                }
            }

            if (stream) {

                // console.log(event.name, event.action, value, 'streaming');

                for await (const txt of event.stream()) {

                    //undo this garbo soon
                    if (message._uuid === undefined) { return; }
                    const [m, index] = getEvent(message._uuid);
                    if (m === undefined) { console.error('could not find message in messages'); }
                    message.content = (message.content + txt).trim();
                    setEvent(index, message);

                }

                // console.log(event.name, event.action, value, 'streaming done');
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
            // console.log('disconnecting soul', soulSettings.blueprint);
            initSoul.disconnect();
        };

    }, [soulSettings, character])



    useEffect(() => {
        if (soul && soul.connected && room) {
            setRoomAndEnvironment(soul, room);
            // expireSoul();
        }
    }, [room, soul])

    //takes the global environment (room and combined with the local souls environment)
    function setRoomAndEnvironment(soul: Soul, newEnvironment: Record<string, any>) {
        const combined = { ...newEnvironment, ...environment };
        // console.log('setting env vars', JSON.stringify(combined, null, 2))
        soul.setEnvironment(combined);
    }


    //routes new messages to each soul
    //TODO move this out to its own hook?
    useEffect(() => {

        if (!soul || !settings.canHear) { return }
        let timer = null;

        if (messages && connected && messages.length > 0) {

            const newMessage = messages[messages.length - 1];
            // console.log('newWorldState', JSON.stringify(newMessage))

            if (newMessage.type === 'says' && newMessage !== localRoomState && newMessage?.character?.name !== character.name) {
                setState('processing');

                timer = setTimeout(() => {
                    // console.log('timer');
                    // console.log(`${soulID.blueprint}: New world state`, newWorldState);

                    setLocalRoomState(newMessage);
                    sendPerception(newMessage?.character?.name ?? 'Interlocutor', newMessage.content);

                    setState('thinking');

                }, 500);
            }
        }

        return () => {
            if (timer) clearTimeout(timer);
        }

    }, [soul, messages, character, settings])

    function sendPerception(name: string, content: string) {
        if (!soul) { console.error('no soul!'); return; }
        // console.log(`${character.name.toUpperCase()} percepting ${content.slice(0, 10)}`);
        soul.dispatch(said(name, content));
    }

    return { localMessages, state, metadata, sendPerception }
}