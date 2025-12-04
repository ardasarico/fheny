'use client';

import { usePortfolio } from '@/hooks/usePortfolio';

export default function BalanceSection() {
  const { data, isLoading } = usePortfolio();

  const totalValue = data?.totalUsdValue ?? 0;

  return (
    <div className="flex h-[275px] flex-col items-center justify-center gap-[72px] bg-gradient-to-b from-neutral-100 to-neutral-200 px-8">
      <p className="font-mono text-[64px] font-semibold leading-normal text-neutral-800">
        {isLoading
          ? '...'
          : `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </p>
    </div>
  );
}
