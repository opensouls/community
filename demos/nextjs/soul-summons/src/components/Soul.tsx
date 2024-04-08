import React, { useEffect, useState, useMemo } from "react"
import { useLocalStorage, useHover } from '@uidotdev/usehooks'
import { Soul, said } from "@opensouls/soul"
import { MessageBox } from "./Messages";
import { useSoulRoom, worldCharacter, MessageProps } from "@/hooks/useSoulRoom";
import { twMerge } from "tailwind-merge";



export function Input({className = ''}: {className?: string}) {

    const { messages, addEvent } = useSoulRoom();
    const cn = twMerge('border-[1px] border-black px-4', className )

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
                    character: worldCharacter,
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


//todo convert to useSoulSimple
export default function SoulVoice({ soulID, character }: { soulID: SoulProps, character: CharacterProps }) {

    const { messages, addEvent } = useSoulRoom();

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

        initSoul.on("says", async ({ content }) => {

            const newContent = await content();
            console.log("Soul said", newContent);

            const messageProp: MessageProps = {
                content: newContent,
                type: "says",
                character: character,
            }

            // setMessages([...messages, messageProp]);
            addEvent(messageProp);
            setThinking(false);

        });

        initSoul.on('thinks', async ({ content }) => {

            const newContent = await content();
            console.log("Soul thinks", newContent);

            const messageProp: MessageProps = {
                content: newContent,
                type: "thinks",
                character: character,
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

        }, 4000);

        return () => clearTimeout(timer);

    }, [messages, character],)

    return (
        <>
            <MessageBox
                messages={localMessages}
                className={'flex grow-1 h-[50em] justify-start bg-[#d4d4d4] opacity-50'}
            />
            {thinking && <div className="relative top-0 right-0">
                <div className="absolute inset-x-0 scale-50">
                    <Sprite src="/sprites/thoughts.png" animate={true} />
                </div>
            </div>}
        </>
    )

}

export function Label({ children, className = '' }) {

    const cn = twMerge(className, 'font-bold font-mono text-md text-left text-[#222] text-center')

    return (
        <div className={cn}>
            {children}
        </div>
    )
}


export function Sprite({ src, animate = false, onClick = () => { } }) {

    const [hover, isHovered] = useHover();
    const [frame, setFrame] = useState<number>(0);

    useEffect(() => {

        if (animate === true) {
            const timer = setTimeout(() => {
                setFrame(frame == 0 ? 1 : 0);
            }, 500);

            return () => clearTimeout(timer);
        }

    }, [frame, animate])

    return (
        <button
            ref={hover}
            onClick={onClick}
            className='flex m-auto w-[128px] h-[128px]'
            style={{
                backgroundImage: `url(${src})`,
                backgroundSize: '200%',
                backgroundPosition: `${!isHovered && frame === 0 ? '100% 0' : '0% 0'}`,
                objectFit: "cover",
                imageRendering: "pixelated",
            }}
        >

        </button>
    )
}