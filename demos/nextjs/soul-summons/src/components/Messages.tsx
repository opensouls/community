import React from 'react';
import { useEffect, useRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSoulRoom, MessageProps, PLAYER_CHARACTER } from '@/hooks/useSoulRoom';
import Markdown from 'react-markdown';

export const ActionCaret = {
    "says": "→",
    "thinks": "~",
    "does": "!",
    "ambience": "...",
}

export const Indentation = {
    "says": "",
    "thinks": "ml-4",
    "does": "ml-4",
    "ambience": "ml-4",
}

export const ActionStyling = {
    "says": "text-black bg-white font-serif",
    "thinks": "font-mono text-gray-600 bg-[#c5c5c5]",
    "does": "font-mono text-red-500 font-serif",
    "ambience": "font-mono text-gray-400 italic bg-[#f5f5f5]",
}

export function Input({ className = '' }: { className?: string }) {

    const { messages, addEvent } = useSoulRoom();
    const cn = twMerge('border-[1px] border-black px-4', className)

    return (
        <form
            className="flex flex-row gap-2"
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
            }}>
            <input
                type="text"
                placeholder="chat"
                className={cn}
            />
            <button>enter</button>
        </form>
    )
}

export function MessageBox({ messages, className = '' }: { messages: MessageProps[], className?: string }) {

    const ref = useRef<HTMLDivElement>(null);
    const cn = twMerge('relative w-full h-24 flex flex-col grow-1 overflow-y-scroll justify-end content-end align-bottom p-2', className);


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
                const nameClassName = `flex text-white w-min p-1 mt-2 ${message?.character?.color}`

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


export function Name({ text = '', className = '', style = {} }) {
    return (
        <div
            className={twMerge('flex font-bold leading-4 tracking-tight', className)}
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