"use client"

import React, { useEffect, useRef, forwardRef, Fragment } from 'react';
import { twMerge } from 'tailwind-merge';
import { useSoulRoom, PLAYER_CHARACTER, MessageProps, CharacterProps, ActionType } from '@/hooks/useSoul';
import { v4 as uuid4 } from 'uuid';
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
    "ambience": "",
    "feels": ">",
    "metadata": "ml-4",
}

export const Indentation: Record<ActionType, string> = {
    "says": "",
    "thinks": "ml-4",
    "does": "ml-4",
    "ambience": "",
    "feels": "ml-4",
    "metadata": "ml-4",
}

export const ActionStyling: Record<ActionType, string> = {
    "says": "font-mono text-secondary",
    "thinks": "font-mono text-secondary ",
    "does": "font-mono text-red-500",
    "ambience": "font-mono text-secondary",
    "feels": "font-mono text-secondary",
    "metadata": "ml-4 text-secondary",
}

type SoulTextAreaProps = {
    character?: CharacterProps,
    textAreaProps: TextAreaProps,
    type?: ActionType,
    className?: string,
    [propName: string]: any
}

export const InputTextArea = forwardRef<HTMLTextAreaElement, SoulTextAreaProps>(({
    character = PLAYER_CHARACTER,
    type = 'says',
    className = '',
    onEnter = () => { },
    ...props }: SoulTextAreaProps, ref) => {

    const cn = twMerge('text-primary bg-primary-bg', className);
    const { addEvent } = useSoulRoom();

    const onSubmit = (text: string) => {
        addEvent({
            content: text,
            action: type,
            character: character,
            _timestamp: Date.now(),
            _uuid: uuid4(),
        });
    }

    return (
        <TextArea
            ref={ref}
            value={''}
            onSubmit={onSubmit}
            className={cn}
            {...props}
        />
    )
});

InputTextArea.displayName = 'InputTextArea';

type TextAreaProps = {
    value: string,
    setValue?: (value: string) => void,
    onSubmit: (value: string) => void,
    className?: string,
    clearOnSubmit?: boolean,
    [propName: string]: any,
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ value = '', setValue = () => { }, onSubmit, className, clearOnSubmit, ...props }, ref) => {

        const [localValue, setLocalValue] = React.useState(value);
        const [lastSubmission, setLastSubmission] = React.useState<string>('');
        const cn = twMerge('p-2', className);

        const handleKeyDown = (event: any) => {
            if (event.key === 'Enter') {
                submit(event);
            }
        };

        const handleBlur = (event: any, fromSubmit = true) => {
            //TODO make this mobile only
            if (localValue !== lastSubmission && !fromSubmit) {
                submit(event);
            }

        };

        const submit = (event: any) => {

            console.log('submitting');
            event.preventDefault();
            setValue(localValue);
            setLastSubmission(localValue);
            onSubmit(localValue);
            //deselect
            if (clearOnSubmit) {
                setLocalValue('');
            }
        }

        const handleClick = (event: React.MouseEvent<HTMLTextAreaElement>) => {
            event.currentTarget.select();
        };

        return (
            <textarea
                ref={ref}
                className={cn}
                value={localValue}
                onChange={(e) => setLocalValue(e.target.value)}
                onKeyDown={handleKeyDown}
                onClick={handleClick}
                onBlur={(e) => { handleBlur(e, false); }}
                style={{ resize: 'none' }}
                spellCheck='false'
                {...props}
            />
        );
    });

TextArea.displayName = 'TextArea';

//styles a list of messages
type MessageWaterfallProps = {
    messages: MessageProps[],
    className?: string,
    messageClass?: string,
    textClass?: string,
    nameClassName?: string,
    children?: React.ReactNode
}

export function MessageWaterfall({ messages, className = '', messageClass = '', textClass = '', nameClassName = '', children }: MessageWaterfallProps) {
    const ref = useRef<HTMLDivElement>(null);
    const cn = twMerge('relative w-full h-24 flex flex-col overflow-y-auto p-2', className);

    useEffect(() => {
        const scrollSmoothly = () => {
            if (ref.current) {
                ref.current.scrollTo({
                    top: ref.current.scrollHeight,
                    behavior: 'smooth'
                });
            }
        };

        window.addEventListener('resize', scrollSmoothly);
        scrollSmoothly();

        return () => window.removeEventListener('resize', scrollSmoothly);
    }, [messages]);


    return (
        <div
            ref={ref}
            className={cn}
        >
            {messages.map((message, index) => {

                const lastMessage = index > 0 ? messages[index - 1] : undefined;
                const showName = message?.character && lastMessage?.character?.name !== message.character.name;

                const messageCN = twMerge('flex flex-row items-start gap-2 text-sm leading-4 tracking-tight', messageClass, message.character.messageStyle);
                const nameCN = twMerge(`mt-2 first:mt-0 mb-1 w-min whitespace-nowrap shrink leading-4 tracking-tight`, nameClassName, message.character.nameStyle)
                const textCN = twMerge('', textClass, message.character.textStyle)

                return (
                    <Fragment key={message._uuid}>
                        {showName &&
                            <Name
                                name={message.character.displayName ?? message.character.name}
                                className={nameCN}
                            />
                        }
                        <Message
                            message={message}
                            className={messageCN}
                            textStyle={textCN}
                        />

                    </Fragment>
                )

            })}
            {children}
        </div>
    )
}

export function Name({ name = '', className = '', style = {} }) {
    return (
        <div
            className={twMerge('', className)}>
            {name}
        </div>
    )
}

export function Message({ message, className = '', textStyle = '' }: { message: MessageProps, className?: string, textStyle?: string }) {

    const caret = ActionCaret[message.action as ActionType] || '';
    const indentation = Indentation[message.action as ActionType];
    const actionStyle = ActionStyling[message.action as ActionType];

    const cn = twMerge('', className);
    const textCN = twMerge('', actionStyle, textStyle);

    return (

        <div className={cn}>
            {caret &&
                <div className={`flex ${textStyle} ${indentation}`}>
                    {caret}
                </div>}

            <Markdown className={textCN}>
                {message.content}
            </Markdown>
        </div>
    )
}