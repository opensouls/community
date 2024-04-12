import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

export function Input({ className, value, setValue, ...props }: any) {

    const [v, setV] = useState<string>(value)

    const cn = twMerge('duration-100 flex flex-row gap-1 overflow-x-clip', className)
    const submit = v !== value ? 'w-[4em]' : 'w-[0px]'

    const handleSubmit = (event: any) => {
        event.preventDefault();
        if (window.getSelection) { window?.getSelection()?.removeAllRanges(); }
        setValue(v);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setV(event.target.value);
    }

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        event.currentTarget.select();
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setV(value);
        }
    };

    return (
        <form className={cn} onSubmit={handleSubmit}>
            <input
                className='border-[1px] w-[100%] text-center border-gray-400 px-2 focus:outline-none text-black rounded-md'
                type='text'
                value={v}
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onClick={handleClick}
                onSubmit={handleSubmit}
                {...props}
            />
            <button onClick={handleSubmit} className={`duration-100 ${submit}`}>enter</button>
        </form>
    )
}
