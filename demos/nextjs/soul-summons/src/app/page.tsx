import Thinker from "./thinking-meme/Thinker";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col align-middle justify-center min-h-screen m-0 bg-white selection:bg-gray-200 gap-4 font-serif  overflow-hidden">

      {/* <Layout /> */}
      <Thinker />
      <a href='https://www.opensouls.studio/' target='_blank' className="flex mx-auto w-[8em]">
        <Image src='/logo.png' alt='OpenSouls logo' width={100} height={100} className='color-black text-black mx-auto opacity-50' />
      </a>

    </main>
  );
}
