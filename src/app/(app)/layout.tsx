'use client';

import PageHeader from '@/components/PageHeader';
import Sidebar from '@/components/sidebar';
import { CofheProvider } from '@/hooks/useFhenixCofhe';
import { useWalletStore } from '@/store/useWalletStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const wallets = useWalletStore(state => state.wallets);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && wallets.length === 0) {
      router.replace('/create-wallet');
    }
  }, [mounted, wallets.length, router]);

  // Show nothing while checking wallet status
  if (!mounted) {
    return (
      <main className="mr-18 flex h-full items-center justify-center">
        <Sidebar />
        <div className="flex h-full w-full max-w-[720px] flex-col border-x border-neutral-300">
          <div className="flex h-14 items-center border-b border-neutral-300 px-4">
            <div className="h-4 w-24 animate-pulse rounded bg-neutral-200" />
          </div>
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-800" />
          </div>
        </div>
      </main>
    );
  }

  // Redirect to create wallet if no wallets
  if (wallets.length === 0) {
    return null;
  }

  return (
    <CofheProvider>
      <main className="mr-18 flex h-full items-center justify-center">
        <Sidebar />
        <div className="flex h-full w-full max-w-[720px] flex-col border-x border-neutral-300">
          <PageHeader />
          <div className="h-full w-full overflow-y-scroll">{children}</div>
        </div>
      </main>
    </CofheProvider>
  );
}
