'use client';

import { usePathname } from 'next/navigation';
import AccountSelector from './AccountSelector';

const pages = [
  { url: '/', title: 'Overview' },
  { url: '/history', title: 'History' },
  { url: '/swap', title: 'Swap' },
  { url: '/connectedapps', title: 'Connected Applications' },
  { url: '/settings', title: 'Settings' },
];

const PageHeader = () => {
  const pathname = usePathname();
  const current = pages.find(p => p.url === pathname);

  return (
    <div className="flex h-[48px] w-full flex-none items-center justify-between border-b border-neutral-300">
      <h1 className="pl-4 font-medium text-neutral-800">{current?.title ?? 'Page'}</h1>

      <AccountSelector />
    </div>
  );
};

export default PageHeader;
