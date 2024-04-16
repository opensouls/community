import { twMerge } from "tailwind-merge"

export default function Badge({ className = '', children }: { className: string, children: React.ReactNode }) {
    const styling = 'flex flex-row w-min items-center bg-gray-200 select-none text-gray-400 text-xs hover:text-gray-600 px-3 py-1 gap-3 rounded-2xl whitespace-nowrap justify-center font-mono';
    const cn = twMerge(styling, className);
    return (
        <div className={cn}>
            {children}
        </div>
    )
}

export function Pulse() {
    return (
        <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
        </span>
    )
}