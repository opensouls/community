import React, { Children, useState } from 'react';

export function CharacterBox({ children } : { children: React.ReactNode }) {

    return (
        <div className="flex flex-col w-[25em] h-[30em] p-2">
            {children}
        </div>
    )

}

