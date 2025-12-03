'use client';

import AddTokenModal from '@/components/AddTokenModal';
import { Button } from '@/components/Button';
import { getActiveWallet } from '@/lib/getActiveWallet';
import { useWalletStore } from '@/store/useWalletStore';
import { useEffect, useState } from 'react';

export default function Settings() {
  const [mounted, setMounted] = useState(false);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const activeWallet = getActiveWallet();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={'flex flex-col gap-6 p-4'}>
        <h2 className={'text-2xl font-semibold text-neutral-800'}>Settings</h2>
        <p className={'text-neutral-600'}>Loading...</p>
      </div>
    );
  }

  return (
    <div className={'flex flex-col gap-6 p-4'}>
      <h2 className={'text-2xl font-semibold text-neutral-800'}>Settings</h2>

      <div className={'flex flex-col gap-2'}>
        <h3 className={'text-lg font-medium text-neutral-800'}>Active Wallet ID</h3>
        <p className={'font-mono text-sm text-neutral-700'}>{activeWalletId || 'No active wallet'}</p>
      </div>

      <div className={'flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm'}>
        <div className={'flex items-center justify-between'}>
          <div>
            <h3 className={'text-lg font-medium text-neutral-800'}>Tokens</h3>
            <p className={'text-sm text-neutral-600'}>Yeni bir token eklemek için adres gir.</p>
          </div>
          <Button size="md" onClick={() => setIsAddTokenModalOpen(true)}>
            Add Token
          </Button>
        </div>
      </div>

      <div className={'flex flex-col gap-2'}>
        <h3 className={'text-lg font-medium text-neutral-800'}>All Wallets (Raw JSON)</h3>
        <pre className={'overflow-auto rounded-xs border border-neutral-300 bg-neutral-100 p-4 text-sm'}>{JSON.stringify(wallets, null, 2)}</pre>
      </div>

      {activeWallet && (
        <div className={'flex flex-col gap-2'}>
          <h3 className={'text-lg font-medium text-neutral-800'}>Active Wallet Details</h3>
          <pre className={'overflow-auto rounded-xs border border-neutral-300 bg-neutral-100 p-4 text-sm'}>{JSON.stringify(activeWallet, null, 2)}</pre>
        </div>
      )}

      <AddTokenModal isOpen={isAddTokenModalOpen} onClose={() => setIsAddTokenModalOpen(false)} />
    </div>
  );
}
