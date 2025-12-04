'use client';

import Link from 'next/link';
import { useState } from 'react';
import ReceiveModal from './ReceiveModal';
import SendModal from './SendModal';

import IconArrowInbox from '@icon/arrow-inbox.svg';
import IconArrowOutOfBox from '@icon/arrow-out-of-box.svg';
import IconArrowsRepeat from '@icon/arrows-repeat.svg';

export default function ActionButtons() {
  const [isSendOpen, setIsSendOpen] = useState(false);
  const [isReceiveOpen, setIsReceiveOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center border-b border-neutral-300">
        <button
          onClick={() => setIsSendOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 border-r border-neutral-300 bg-white px-0 py-4 transition-colors hover:bg-neutral-300"
        >
          <span className="text-lg font-medium leading-6 text-neutral-800">Send</span>
          <IconArrowOutOfBox className="size-6 text-neutral-600" />
        </button>
        <button
          onClick={() => setIsReceiveOpen(true)}
          className="flex flex-1 items-center justify-center gap-2 border-r border-neutral-300 bg-white px-0 py-4 transition-colors hover:bg-neutral-300"
        >
          <span className="text-lg font-medium leading-6 text-neutral-800">Receive</span>
          <IconArrowInbox className="size-6 text-neutral-600" />
        </button>
        <Link
          href="/swap"
          className="flex flex-1 items-center justify-center gap-2 bg-white px-0 py-4 transition-colors hover:bg-neutral-300"
        >
          <span className="text-lg font-medium leading-6 text-neutral-800">Swap</span>
          <IconArrowsRepeat className="size-6 text-neutral-600" />
        </Link>
      </div>

      <SendModal isOpen={isSendOpen} onClose={() => setIsSendOpen(false)} />
      <ReceiveModal isOpen={isReceiveOpen} onClose={() => setIsReceiveOpen(false)} />
    </>
  );
}
