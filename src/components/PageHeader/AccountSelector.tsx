'use client';

import { getActiveWallet } from '@/lib/getActiveWallet';
import { switchWallet } from '@/lib/switchWallet';
import { useWalletStore } from '@/store/useWalletStore';
import { Menu } from '@base-ui-components/react/menu';
import { useEffect, useState } from 'react';

//icons
import IconChevronDown from '@icon/chevron-down.svg';
import IconPlus from '@icon/plus.svg';
import Link from 'next/link';

export default function AccountSelector() {
  const [mounted, setMounted] = useState(false);
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const selected = getActiveWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex h-full items-center gap-2 px-4">
        <div className="h-4 w-4 rounded-sm bg-neutral-300" />
        <div className="mr-3 h-4 w-20 animate-pulse rounded bg-neutral-300" />
        <IconChevronDown className="text-neutral-600" />
      </div>
    );
  }

  if (!selected && wallets.length === 0) {
    return null;
  }

  const otherWallets = wallets.filter(w => w.id !== activeWalletId);

  const handleSwitchWallet = (id: string) => {
    switchWallet(id);
  };

  return (
    <Menu.Root>
      <Menu.Trigger className="flex h-full items-center gap-2 px-4 transition duration-150 ease-out hover:bg-neutral-200 data-[popup-open]:bg-neutral-200">
        {selected && (
          <>
            <div className="aspect-square h-4 rounded-sm" style={{ backgroundColor: selected.color }} />
            <p className="mr-3 text-sm text-neutral-800">{selected.name}</p>
          </>
        )}
        <IconChevronDown className="text-neutral-600" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align={'end'} style={{ minWidth: 'var(--anchor-width)' }}>
          <Menu.Popup className="border border-neutral-300 bg-neutral-200">
            {otherWallets.map(wallet => (
              <Menu.Item
                key={wallet.id}
                onClick={() => handleSwitchWallet(wallet.id)}
                className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-300"
              >
                <div className="aspect-square h-4 rounded-sm" style={{ backgroundColor: wallet.color }} />
                <p>{wallet.name}</p>
              </Menu.Item>
            ))}

            {wallets.length > 0 && <Menu.Separator className="mx-4 my-1 h-px bg-neutral-400" />}

            <Menu.Item>
              <Link href={'/create-wallet'} className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-300">
                <div className="grid aspect-square h-4 place-content-center">
                  <IconPlus className="text-neutral-700" />
                </div>
                Create Wallet
              </Link>
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
