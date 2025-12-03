'use client';

import Link from 'next/link';

import IconArrowInbox from '@icon/arrow-inbox.svg';
import IconArrowOutOfBox from '@icon/arrow-out-of-box.svg';
import IconArrowsRepeat from '@icon/arrows-repeat.svg';

export default function ActionButtons() {
  return (
    <div className="flex h-14 items-center border-b border-neutral-300">
      <Link
        href="/send"
        className="flex flex-1 items-center justify-center gap-2 border-r border-neutral-300 bg-white px-0 py-4 transition-colors hover:bg-neutral-300"
      >
        <span className="text-lg leading-6 font-medium text-neutral-800">Send</span>
        <IconArrowOutOfBox className="size-6 text-neutral-600" />
      </Link>
      <Link
        href="/receive"
        className="flex flex-1 items-center justify-center gap-2 border-r border-neutral-300 bg-white px-0 py-4 transition-colors hover:bg-neutral-300"
      >
        <span className="text-lg leading-6 font-medium text-neutral-800">Receive</span>
        <IconArrowInbox className="size-6 text-neutral-600" />
      </Link>
      <Link href="/swap" className="flex flex-1 items-center justify-center gap-2 bg-white px-0 py-4 transition-colors hover:bg-neutral-300">
        <span className="text-lg leading-6 font-medium text-neutral-800">Swap</span>
        <IconArrowsRepeat className="size-6 text-neutral-600" />
      </Link>
    </div>
  );
}
