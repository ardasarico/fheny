'use client';

import { useEffect, useState } from 'react';
import { useTokenStore } from '@/store/useTokenStore';
import { useWalletStore } from '@/store/useWalletStore';
import { calculateTotalValueWithTokens } from '@/lib/calculateTotalValue';

const TEN_MINUTES_MS = 10 * 60 * 1000;

export default function BalanceSection() {
  const { tokens } = useTokenStore();
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const [totalValue, setTotalValue] = useState<string>('0.00');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function updateTotalValue(force = false) {
      if (!isMounted) return;
      setLoading(true);
      try {
        const result = await calculateTotalValueWithTokens(tokens.map(t => t.address), { force });
        if (!isMounted) return;
        setTotalValue(result.totalUsdValue.toFixed(2));
      } catch (error) {
        console.error('Error calculating total value:', error);
        setTotalValue('0.00');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!activeWalletId) {
      setTotalValue('0.00');
      setLoading(false);
      return;
    }

    updateTotalValue();

    const interval = setInterval(() => {
      updateTotalValue(true);
    }, TEN_MINUTES_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tokens, activeWalletId]);

  return (
    <div className="flex h-[275px] flex-col items-center justify-center gap-[72px] bg-gradient-to-b from-neutral-100 to-neutral-200 px-8">
      <p className="font-mono text-[64px] leading-normal font-semibold text-neutral-800">
        {loading ? '...' : `$${parseFloat(totalValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      </p>
    </div>
  );
}
