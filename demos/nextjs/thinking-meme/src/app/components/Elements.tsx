import Badge, { Pulse } from '@/components/Badge';
import Image from 'next/image';
import getAssetPath from "@/lib/assets";

export function Footer({}) {

    return (
        <div className='mx-auto flex flex-col align-middle gap-3'>

            <a href={'https://github.com/opensouls/community'} target='_blank'>
                <Badge className='mx-auto'>
                    <Pulse />
                    {'thinking-meme'}
                </Badge>
            </a>
            <a href='https://discord.gg/opensouls' target='_blank' className="flex mx-auto w-[8em] mt-[-.25em]">
                <Image src={getAssetPath('/logo.png')} alt='OpenSouls logo' width={100} height={100} className='color-black text-black mx-auto opacity-50' />
            </a>
        </div>
    )
}