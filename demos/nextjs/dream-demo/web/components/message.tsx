import { UserIcon } from "lucide-react";
import Image from "next/image";
import { ReactNode } from "react";

export default function Message({
  name,
  avatarUrl,
  children,
}: {
  name: string;
  avatarUrl: string;
  children: ReactNode;
}) {
  return (
    <div className="flex">
      <div className="hidden sm:block border-4 border-r-0 border-primary shrink-0 h-[92px] rounded-l-2xl overflow-hidden">
        <Avatar avatarUrl={avatarUrl} />
      </div>
      <div className="px-4 p-3 bg-white border-4 border-primary w-full overflow-x-scroll rounded-2xl sm:rounded-l-none ">
        <div className="flex gap-2 items-center font-heading tracking-tighter text-xl mb-2">
          <div className="mt-1 sm:hidden rounded-lg overflow-hidden">
            <Avatar avatarUrl={avatarUrl} />
          </div>
          <div>{name}</div>
        </div>
        <div className="min-w-24">{children}</div>
      </div>
    </div>
  );
}

function Avatar({ avatarUrl }: { avatarUrl: string }) {
  return !avatarUrl ? (
    <div className="w-[36px] h-[36px] sm:w-[84px] sm:h-[84px] bg-primary flex items-center justify-center">
      <UserIcon size={32} className="text-white" />
    </div>
  ) : avatarUrl.startsWith("http") ? (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img src={avatarUrl} className="w-[36px] h-[36px] sm:w-[84px] sm:h-[84px]" width={84} height={84} alt="User" />
  ) : (
    <Image
      src={avatarUrl}
      className="w-[36px] h-[36px] sm:w-[84px] sm:h-[84px]"
      width={84}
      height={84}
      alt="Kathor"
    />
  );
}
