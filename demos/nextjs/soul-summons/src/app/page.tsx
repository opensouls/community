import Thinker from "./thinking-meme/Thinker";
import ThinkerRoleplay from "./thinking-meme/ThinkerRoleplay";
import Image from 'next/image';

export default function Home() {
  return (
    <main className="flex flex-col align-middle justify-center min-h-screen m-0 bg-white selection:bg-gray-200 gap-4 font-serif  overflow-hidden">

      {/* <Thinker /> */}
      <ThinkerRoleplay />
  
    </main>
  );
}
