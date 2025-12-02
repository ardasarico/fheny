'use client';

import { getActiveWallet } from '@/lib/getActiveWallet';
import { getBalance } from '@/lib/getBalance';
import { useWalletStore } from '@/store/useWalletStore';
import { useEffect, useState } from 'react';

export default function Home() {
  const wallets = useWalletStore(state => state.wallets);
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const activeWallet = getActiveWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  useEffect(() => {
    const fetchBalance = async () => {
      const wallet = getActiveWallet();
      if (!wallet) {
        setBalance(null);
        return;
      }

      setIsLoadingBalance(true);
      try {
        const walletBalance = await getBalance();
        setBalance(walletBalance);
      } catch (error) {
        console.error('Failed to fetch balance:', error);
        setBalance('Error');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchBalance();
  }, [activeWalletId, activeWallet?.address]);

  return (
    <div className={'flex flex-col gap-6 p-4'}>
      <div className={'flex flex-col gap-2'}>
        <h2 className={'text-2xl font-semibold text-neutral-800'}>Active Wallet ID</h2>
        <p className={'font-mono text-lg text-neutral-700'}>{activeWalletId || 'No active wallet'}</p>
      </div>

      {activeWallet && (
        <div className={'flex flex-col gap-2'}>
          <div className={'flex items-center justify-between'}>
            <h2 className={'text-2xl font-semibold text-neutral-800'}>Balance</h2>
            <button
              onClick={() => {
                const fetchBalance = async () => {
                  setIsLoadingBalance(true);
                  try {
                    const walletBalance = await getBalance();
                    setBalance(walletBalance);
                  } catch (error) {
                    console.error('Failed to fetch balance:', error);
                    setBalance('Error');
                  } finally {
                    setIsLoadingBalance(false);
                  }
                };
                fetchBalance();
              }}
              className={'rounded-xs border border-neutral-300 bg-neutral-200 px-3 py-1.5 text-sm text-neutral-800 hover:bg-neutral-300'}
              disabled={isLoadingBalance}
            >
              {isLoadingBalance ? 'Loading...' : 'Refresh'}
            </button>
          </div>
          <p className={'font-mono text-lg text-neutral-700'}>{isLoadingBalance ? 'Loading...' : balance !== null ? `${balance} ETH` : 'N/A'}</p>
          <p className={'text-xs text-neutral-500'}>Address: {activeWallet.address}</p>
        </div>
      )}

      <div className={'flex flex-col gap-2'}>
        <h2 className={'text-2xl font-semibold text-neutral-800'}>All Wallets (Raw JSON)</h2>
        <pre className={'overflow-auto rounded-xs border border-neutral-300 bg-neutral-100 p-4 text-sm'}>{JSON.stringify(wallets, null, 2)}</pre>
      </div>

      {activeWallet && (
        <div className={'flex flex-col gap-2'}>
          <h2 className={'text-2xl font-semibold text-neutral-800'}>Active Wallet Details</h2>
          <pre className={'overflow-auto rounded-xs border border-neutral-300 bg-neutral-100 p-4 text-sm'}>{JSON.stringify(activeWallet, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
