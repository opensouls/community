import React, { useState, useEffect, useCallback, createContext, forwardRef } from "react"

import { ArrowUpIcon, CheckCircledIcon, CodeIcon, Cross1Icon, DiscordLogoIcon, EyeClosedIcon, EyeOpenIcon, FaceIcon, GitHubLogoIcon, OpenInNewWindowIcon, Pencil1Icon, QuestionMarkCircledIcon, ReaderIcon } from "@radix-ui/react-icons";
import { useHover } from "@uidotdev/usehooks";
import { useLocalStorage } from "usehooks-ts";
import { twMerge } from "tailwind-merge";

import { SoulHook, SoulProperties, SoulProps } from "../hooks/useSoul";
import { Soul } from "@opensouls/soul";
import SoulLogo from "./SoulLogo";

export type SoulEditorProps = {
    devMode: boolean, //whether or not to append a prod or dev-id to the soulId?
}

const BG = forwardRef<HTMLDivElement, { children: React.ReactNode, className?: string }>(({ children, className = '' }, ref) => {
    const cn = twMerge(`rounded-md bg-black border-[1px] border-gray-800 shadow-2xl`, className);

    return (
        <div ref={ref} className={cn}>
            {children}
        </div>
    );
});

BG.displayName = 'BG';

const Button = forwardRef<HTMLButtonElement, { children: React.ReactNode, className?: string, onClick?: () => void }>(({ children, className = '', onClick }, ref) => {
    const cn = twMerge(`flex flex-row items-center align-middle justify-center opacity-75 hover:opacity-100`, className);

    return (
        <button
            ref={ref}
            className={cn}
            onClick={onClick}
        >
            {children}
        </button>
    );
});

Button.displayName = 'Button';

function IconState(
    { icon, state, flag, className, children }:
        { icon: React.ReactNode, state: React.ReactNode, flag: boolean, className?: string, children?: React.ReactNode }) {

    return (
        <div className="flex flex-row items-center">
            {flag ? state : icon}
            {children}
        </div>
    );
}

function IconStateWithHover(
    { icon, hover, isHovered, flag, className, children }:
        { icon: React.ReactNode, hover: React.ReactNode, isHovered: boolean, flag: boolean, className?: string, children?: React.ReactNode }) {

    const defaultIcon = flag ? icon : hover;
    const hoverIcon = flag ? hover : icon;

    const cn = twMerge(`flex flex-row items-center`, className);

    return (
        <div className={cn}>
            {isHovered ? hoverIcon : defaultIcon}
            {children}
        </div>
    );
}

export default function SoulEditor({ children, souls = [], editor }: { children: React.ReactNode, souls?: SoulHook[], editor?: SoulEditorProps }) {

    const [isMinimized, setMinimized,] = useLocalStorage('opensouls_minimized', false, { initializeWithValue: false })

    const [hoverRef, isHovered] = useHover();
    const [hoverBarRef, isBarHovered] = useHover();
    const [hoverMinimize, isHoverMinimized] = useHover();

    const [selectedSoul, setSelectedSoul] = useState(souls.length > 0 ? souls[0] : {} as Soul);

    const debugMode = process.env.NEXT_PUBLIC_SOUL_ENGINE_DASHBOARD === 'true';
    const hasApiKey = process.env.NEXT_PUBLIC_SOUL_ENGINE_APIKEY !== undefined;

    if (!debugMode) {
        return (
            <SoulProvider souls={souls}>
                {children}
            </SoulProvider>
        )
    }

    return (

        <SoulProvider souls={souls}>
            {children}

            <div className={`fixed duration-200 bg-pink-500 w-screen bottom-0 flex flex-col items-center pointer-events-none`}>

                <div
                    className={`absolute flex flex-col duration-100 ${isMinimized ? 'bottom-4 opacity-0' : 'bottom-16'} w-96 gap-2 pointer-events-auto `}
                    ref={hoverRef}>


                    <div className={`flex flex-col gap-1 items-end pt-4 ${(isHovered) ? 'block' : 'hidden'}`}>
                        {souls.map((soul) => (
                            soul?.soul?.soulId ? <SoulMapped key={soul?.soul?.soulId} soul={soul} /> : null
                        ))}
                    </div>

                    <BG
                        className={`flex flex-row items-center whitespace-nowrap py-1 px-2 w-full ${isMinimized ? '' : ''} justify-between ${isBarHovered ? 'border-gray-700' : ''}`}
                        ref={hoverBarRef}
                    >
                        <button
                            className={`flex flex-row align-middle`}
                            onClick={() => setMinimized(!isMinimized)}
                        >
                            <div className='w-32 ml-2'>
                                <SoulLogo />
                            </div>
                            {/* <img className="w-32 ml-2" src="logo_horizontal.svg" /> */}

                        </button>

                        <div className={`flex flex-row items-center gap-1`}>

                            <Button
                                className="p-2"
                                onClick={() => open('https://docs.souls.chat/', '_blank')}
                            >
                                <ReaderIcon />
                            </Button>

                            <Button
                                className="p-2"
                                onClick={() => open('https://discord.com/invite/opensouls', '_blank')}
                            >
                                <DiscordLogoIcon />
                            </Button>

                            <Button
                                className="p-2"
                                ref={hoverMinimize}
                                onClick={() => setMinimized(!isMinimized)}
                            >
                                <IconState
                                    icon={<Cross1Icon />}
                                    state={<Cross1Icon />}
                                    flag={isMinimized}
                                />

                            </Button>

                        </div>
                    </BG>
                </div>


                <button
                    className={`fixed flex flex-col inset-x-0 duration-200 bottom-4 p-2 pointer-events-auto ease-out ${isMinimized ? 'translate-y-0 opacity-50' : 'translate-y-12 opacity-0'}`}
                    onClick={() => setMinimized(!isMinimized)}
                >
                    <ArrowUpIcon className="mx-auto" />
                </button>
            </div>

        </SoulProvider >

    );
}


const soulToURI = (soul: Soul, soulProps: SoulProps) => {
    //https://souls.chat/chats/neilsonnn/thinking-meme/4ee86bd0-d0eb-4f2f-808e-7ed9bf492925
    return `https://souls.chat/chats/${soulProps.organization}/${soulProps.blueprint}/${soul.soulId}`;
}

function SoulMapped({ soul }: { soul: SoulHook }) {

    const [hoverRef, isHovered] = useHover();
    const [age, setAge] = useState<string>('');

    const URICallback = useCallback(() => {
        const URI = soulToURI(soul.soul, soul.soulProps);
        window.open(URI, '_blank');
    }, [soul.soul.soulId]);

    useEffect(() => {
        const now = new Date();
        const pastDate = new Date(now.getFullYear(), now.getMonth() - 1, Math.floor(Math.random() * 28) + 1, Math.floor(Math.random() * 24), Math.floor(Math.random() * 60), Math.floor(Math.random() * 60));
        setAge(ageString(pastDate, now));
    }, [])

    // console.log(soul.character.name, soul.soul.connected)

    return (
        <BG
            className={`w-full flex flex-row gap-4 justify-between px-3 py-1 ${isHovered ? 'opacity-100' : 'opacity-75'}`}
            ref={hoverRef}
        >

            <div className="flex flex-row gap-2 items-center">
                {soul?.soul?.connected ? (
                    <CheckCircledIcon className="text-green-500" />
                ) : (
                    <QuestionMarkCircledIcon className="text-orange-500 animate-spin" />
                )}
                <p className="select-none text-left whitespace-nowrap">{soul.soulProps.blueprint}</p>
                <p className="select-none text-left whitespace-nowrap text-xs text-gray-500">{age}</p>
            </div>

            <div className={`flex flex-row gap-2 items-center ${isHovered ? 'flex' : 'hidden'}`}>
                {/* {soul?.settings?.code && <button
                    className={`p-1 hover:opacity-100 opacity-75`}
                    onClick={() => open(soul.settings.code, '_blank')}
                >
                    <CodeIcon />
                </button>} */}

                {/* TODO editable README?? */}
                {/* <button
                    className={`p-1 hover:opacity-100 opacity-75`}
                    onClick={() => URICallback()}
                >
                    <Pencil1Icon />
                </button> */}

                {soul.soulProps.debug === true &&
                    <button
                        className={`p-1 hover:opacity-100 opacity-75`}
                        onClick={() => URICallback()}
                    >
                        <EyeOpenIcon />
                    </button>}
            </div>

        </BG>
    )
}

//create a react provider for the souls
const SoulContext = createContext<SoulHook[]>([]);

export function SoulProvider({ children, souls }: { children: React.ReactNode, souls: SoulHook[] }) {

    return (
        <SoulContext.Provider value={souls}>
            {children}
        </SoulContext.Provider>
    );
}

function ageString(fromDate: Date, toDate: Date): string {
    const diff = toDate.getTime() - fromDate.getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365));
    if (years > 0) return `${years} year${years > 1 ? 's' : ''}`;

    const months = Math.floor(diff / (1000 * 60 * 60 * 24 * 30));
    if (months > 0) return `${months} month${months > 1 ? 's' : ''}`;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    return `${days} day${days > 1 ? 's' : ''}` || "0 days";
}
