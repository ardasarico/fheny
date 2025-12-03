'use client';

import ActionButtons from '@/components/ActionButtons';
import BalanceSection from '@/components/BalanceSection';
import TokenList from '@/components/TokenList';

export default function Home() {
  return (
    <div className="flex flex-col">
      <BalanceSection />
      <ActionButtons />
      <div className="flex items-center justify-between border-b border-neutral-300 bg-white px-4 py-3">
        <h2 className="text-lg font-semibold text-neutral-900">Tokens</h2>
      </div>
      <TokenList />
    </div>
  );
}
