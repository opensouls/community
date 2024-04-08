import React, { Children, useState } from 'react';
import { DragSpring } from '@/components/Drag';

export function Carousel({ children }) {

    const mappedChildren = Children.map(children, child =>
        <div className="Row">
            {child}
        </div>
    );

    return (
        <>
            <div>
                {mappedChildren}
            </div>
        </>
    )


}

export function CharacterBox({ children }) {

    return (
        <div className="flex flex-col w-[25em] h-[30em] p-2">
            {children}
        </div>
    )

}

