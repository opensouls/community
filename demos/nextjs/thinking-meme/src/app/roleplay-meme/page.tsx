import ThinkerRoleplay from "./ThinkerRoleplay";
import MadeWithSoulEngine from '@/components/made-with-soul-engine';

export default function Home() {

  return (
    <main className="m-0 bg-white selection:bg-gray-200 font-serif overflow-hidden"> 
      <ThinkerRoleplay />
      <MadeWithSoulEngine className='absolute w-full bottom-8'/>
    </main>
  );
}
