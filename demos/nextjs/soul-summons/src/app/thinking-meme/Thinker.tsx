import React, { useEffect, useState } from 'react';
import Image from 'next/image';

export type ThinkerState = 'waiting' | 'thinking' | 'speaking' | 'having-regrets';

function useThinker() {

}



export default function Thinker() {

    return (
        <>
            <p>whats up?</p>

            <div className='flex flex-col bg-white'>

                <p>whats up?</p>
                <div className='relative bg-green m-auto w-[24em] h-[24em]'>

                    <ImageLayer
                        src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'}
                        alt='Thinker'
                    />
                    <ImageLayer
                        src={'/thinking-meme/ThinkingMeme_0002s_0001_head.png'}
                        alt='Thinker'
                    />
                </div>

            </div>
        </>
    )
}

function ImageLayer({ src = '', alt = '' }) {

    return (
        <Image
            className='absolute m-auto'
            src={src}
            alt={alt}
            width={500}
            height={500}
        />
    )
}