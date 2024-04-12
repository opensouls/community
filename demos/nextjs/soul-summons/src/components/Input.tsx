import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

type InputProps = {
    value: string,
    setValue: (value: string) => void,
    className?: string,
    [propName: string]: any,
}
export function Input({ value, setValue, className, ...props }: InputProps) {

    const [localValue, setLocalValue] = useState<string>(value)

    const cn = twMerge('duration-100 flex flex-row gap-1 overflow-x-clip', className)
    const submitStyle = localValue !== value ? 'w-[4em]' : 'w-[0px]'

    const handleSubmit = (event: any) => {
        if (window.getSelection) { window?.getSelection()?.removeAllRanges(); }
        submit(event);
    }

    const handleBlur = (event: any) => {
        setValue(localValue);
    }

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(event.target.value);
    }

    const handleClick = (event: React.MouseEvent<HTMLInputElement>) => {
        event.currentTarget.select();
    };

    const handleKeyDown = (event: any) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            setLocalValue(value);
        }
    };

    const submit = (event: any) => {
        event.preventDefault();
        console.log('submit', localValue, value);
        setValue(localValue);
    }

    return (
        <form className={cn} onSubmit={handleSubmit}>
            <input
                className='border-[1px] w-[100%] text-center border-gray-400 px-2 focus:outline-none text-black rounded-md'
                type='text'
                value={localValue}

                onKeyDown={handleKeyDown}
                onChange={handleChange}
                onClick={handleClick}
                onSubmit={handleSubmit}
                onBlur={handleBlur}
                {...props}
            />
            <button onClick={handleSubmit} className={`duration-100 ${submitStyle}`}>enter</button>
        </form>
    )
}
