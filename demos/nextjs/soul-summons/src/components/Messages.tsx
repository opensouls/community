"use client"

import React from 'react';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSoulRoom, MessageProps, PLAYER_CHARACTER, ActionType } from '@/hooks/useSoulRoom';
import Markdown from 'react-markdown';

export type TextProps = {
    message: MessageProps,
    showName: boolean,
    actionFilter?: string,
    characterPerspective?: string,
}

export const ActionCaret: Record<ActionType, string> = {
    "says": "→",
    "thinks": "~",
    "does": "!",
    "ambience": "...",
    "feels": ">",
    "state": ">",
}

export const Indentation: Record<ActionType, string> = {
    "says": "",
    "thinks": "ml-4",
    "does": "ml-4",
    "ambience": "ml-4",
    "feels": "ml-4",
    "state": "ml-4",
}

export const ActionStyling: Record<ActionType, string> = {
    "says": "font-mono text-black bg-white",
    "thinks": "font-mono text-gray-600 bg-[#c5c5c5]",
    "does": "font-mono text-red-500",
    "ambience": "font-mono text-gray-400 italic bg-[#f5f5f5]",
    "feels": "font-mono text-black bg-[#f5f5f5]",
    "state": "font-mono text-black bg-[#f5f5f5]",
}

export function InputForm({ children, className = '', ...props }: { children: React.ReactNode, className?: string }) {

    const { addEvent } = useSoulRoom();
    const cn = twMerge('flex flex-row w-min gap-2', className)

    return (
        <>
            <form
                className={cn}
                onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                    e.preventDefault();
                    const inputElement = e.currentTarget.elements[0] as HTMLInputElement;
                    if (inputElement.value === '') return console.log('no content');
                    addEvent({
                        content: inputElement.value,
                        type: 'thinks',
                        character: PLAYER_CHARACTER,
                        timestamp: Date.now(),
                    });
                    inputElement.value = '';
                }}
                {...props}
            >
                {children}
            </form>
        </>
    )
}

export function Input({ className = '', ...props }: { className?: string }) {

    const { addEvent } = useSoulRoom();
    const cn = twMerge('border-[1px] border-black px-4 text-black', className)

    return (
        <form
            className={cn}
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                e.preventDefault();
                const inputElement = e.currentTarget.elements[0] as HTMLInputElement;
                if (inputElement.value === '') return console.log('no content');
                addEvent({
                    content: inputElement.value,
                    type: 'thinks',
                    character: PLAYER_CHARACTER,
                    timestamp: Date.now(),
                });
                inputElement.value = '';
            }}
            {...props}
        >
            <input
                type="text"
                placeholder="chat"
                className={cn}
                {...props}
            />
        </form>
    )
}

export function InputTextArea({ className = '', ...props }: { className?: string, [propName: string]: any }) {

    const { addEvent } = useSoulRoom();
    const [value, setValue] = React.useState('');

    const cn = twMerge('border-[1px] border-black px-4 text-black', className);

    const handleKeyDown = (event: any) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            addEvent({
                content: value,
                type: 'thinks',
                character: PLAYER_CHARACTER,
                timestamp: Date.now(),
            });
            setValue('');
        }
    };

    const handleClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
        event.currentTarget.select();
    };


    return (
        <textarea
            className={cn}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onClick={handleClick}
            style={{ resize: 'none' }}
            spellCheck='false'
            {...props}
        />
    );
}


export function MessageBox({ messages, className = '' }: { messages: MessageProps[], className?: string }) {

    const ref = useRef<HTMLDivElement>(null);
    const cn = twMerge('relative border-black border-[1px] w-full h-24 flex flex-col overflow-y-scroll p-2', className);


    useEffect(() => {
        if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    }, [messages])

    return (
        <div
            ref={ref}
            className={cn}>
            {messages.map((message, index) => {

                const lastMessage = index > 0 ? messages[index - 1] : undefined;
                const showName = message?.character && lastMessage?.character?.name !== message.character.name;
                const nameClassName = `flex w-min text-black underline p-1 mt-1 ${message?.character?.color}`

                return (
                    <div key={message?.timestamp}>
                        {showName &&
                            <Name
                                text={message?.character?.name}
                                className={nameClassName} //
                            // style={{ backgroundColor: message.character.color }}
                            />
                        }
                        <Message
                            message={message}
                            className={''}
                        />

                    </div>
                )

            })}
        </div>
    )
}

export function MessageSlug({ message }: { message: MessageProps }) {

    return (
        <div className='flex flex-row text-sm leading-4 tracking-tight'>
            <div className={`p-1 flex ${ActionStyling[message.type]} ${Indentation[message.type]}`}>
                {ActionCaret[message.type]}
            </div>
            <div className={`p-1 ${ActionStyling[message.type]}`}>
                <Markdown>
                    {message.content}
                </Markdown>
            </div>
        </div>
    )
}



export function Name({ text = '', className = '', style = {} }) {
    return (
        <div
            className={twMerge('flex leading-4 tracking-tight', className)}
        >
            {text}
        </div>
    )
}

export function Message({ message, className = '' }: { message: MessageProps, className?: string }) {

    return (
        <div className={twMerge(className, 'flex flex-row text-sm leading-4 tracking-tight')}>
            <div className={`p-1 flex ${ActionStyling[message.type]} ${Indentation[message.type]}`}>
                {ActionCaret[message.type]}
            </div>
            <div className={`p-1 ${ActionStyling[message.type]}`}>
                <Markdown>
                    {message.content}
                </Markdown>
            </div>
        </div>
    )
}