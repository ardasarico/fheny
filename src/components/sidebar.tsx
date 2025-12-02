'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// icons
import IconArrowsRepeat from '@icon/arrows-repeat.svg';
import IconGear from '@icon/gear.svg';
import IconHistory from '@icon/history.svg';
import IconShapesPlus from '@icon/shapes-plus.svg';
import IconWallet from '@icon/wallet.svg';

const pages = [
  { href: '/', icon: IconWallet },
  { href: '/history', icon: IconHistory },
  { href: '/swap', icon: IconArrowsRepeat },
  { href: '/connectedapps', icon: IconShapesPlus },
  { href: '/settings', icon: IconGear },
];

const Sidebar = () => {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-18 flex-col gap-2.5 p-3">
      {pages.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;

        return (
          <Link
            key={href}
            href={href}
            className={`grid aspect-square w-full place-content-center rounded-md text-[28px] ${
              isActive ? 'bg-neutral-300 text-neutral-700' : 'text-neutral-500'
            }`}
          >
            <Icon />
          </Link>
        );
      })}
    </div>
  );
};

export default Sidebar;
