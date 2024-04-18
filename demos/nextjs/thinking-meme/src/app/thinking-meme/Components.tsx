import { twMerge } from 'tailwind-merge';
import Markdown from 'react-markdown';

export function Bentoish({ className, children }: { className: string, children: React.ReactNode }) {

    const cn = twMerge(``, className); //rounded-xl border-[1px] border-black

    return (
        <div className={cn}>
            {children}
        </div>
    )
}

export function TextBox({ text = '', className = '', style = {}, ...props }) {

    const cn = twMerge(`p-1 overflow-clip`, className);
    return (
        <Markdown className={cn} {...props} >
            {text}
        </Markdown>
    )
}   
