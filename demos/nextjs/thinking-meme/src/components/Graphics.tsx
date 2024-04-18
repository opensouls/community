"use client"

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useHover } from '@uidotdev/usehooks'
import { twMerge } from 'tailwind-merge'
import getAssetPath from '@/lib/assets'

export function Label({ children, className = '' }: { children: React.ReactNode, className?: string }) {

    const cn = twMerge(className, 'font-bold font-mono text-md text-left text-[#222] text-center')

    return (
        <div className={cn}>
            {children}
        </div>
    )
}


export function Sprite({ src = '', animate = false, onClick = () => { } }) {

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

export function ImageLayer({ src = '', alt = '', className = '', width = 1024, height = 1024 }) {

    const cn = twMerge('absolute m-auto select-none pointer-events-none', className)
    return (
        <>
            {src && src !== getAssetPath('') &&
                <img
                    className={cn}
                    src={src}
                    alt={alt}
                    width={width}
                    height={height}
                />}
        </>
    )
}

export function ImageAnimated({ srcs, rate = 200, className = '' }: { srcs: string[], rate?: number, className?: string }) {

    const [frame, setFrame] = useState<number>(0);

    useEffect(() => {

        const timer = setInterval(() => {
            setFrame(frame == srcs.length - 1 ? 0 : frame + 1);
        }, rate);

        return () => clearInterval(timer);

    }, [frame, rate])

    return (
        <ImageLayer src={srcs[frame]} className={className} />
    )
}

export function Blinking(
    { enabled = true, rate = 500, opacity = false, opacityClass = 'opacity-50', className = '', children }:
        { enabled?: boolean, rate?: number, opacity?: boolean, opacityClass?: string, className?: string, children: React.ReactNode }
) {

    const [visible, setVisible] = useState<boolean>(true);
    const cn = twMerge(opacity ? (visible ? 'opacity-100' : opacityClass) : (visible ? 'visible' : 'invisible'), className);

    useEffect(() => {
        if (!enabled) {
            setVisible(true);
            return;
        }
        const timer = setInterval(() => {
            setVisible(last => !last);
        }, rate);

        return () => clearInterval(timer);
    }, [rate, enabled])

    return (
        <div className={cn}>
            {children}
        </div>
    )

}