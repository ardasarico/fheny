'use client';

import { calculateTotalValueWithTokens, TokenWithPrice } from '@/lib/calculateTotalValue';
import { useTokenStore } from '@/store/useTokenStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useEffect, useState } from 'react';

interface EthListItem {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  usdValue: number;
}

type TokenListItem = TokenWithPrice;

const TEN_MINUTES_MS = 10 * 60 * 1000;

export default function TokenList() {
  const { tokens } = useTokenStore();
  const activeWalletId = useWalletStore(state => state.activeWalletId);
  const [tokenData, setTokenData] = useState<TokenListItem[]>([]);
  const [ethData, setEthData] = useState<EthListItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadTokenData(force = false) {
      if (!isMounted) return;
      setLoading(true);
      try {
        const result = await calculateTotalValueWithTokens(
          tokens.map(t => t.address),
          { force },
        );
        if (!isMounted) return;

        setEthData({
          symbol: 'ETH',
          name: 'Ethereum',
          balance: result.ethBalance,
          price: result.ethPrice,
          usdValue: result.ethUsdValue,
        });
        setTokenData(result.tokens);
      } catch (error) {
        console.error('Error loading token data:', error);
        if (!isMounted) return;
        setEthData(null);
        setTokenData([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (!activeWalletId) {
      setEthData(null);
      setTokenData([]);
      setLoading(false);
      return;
    }

    loadTokenData();

    const interval = setInterval(() => {
      loadTokenData(true);
    }, TEN_MINUTES_MS);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [tokens, activeWalletId]);

  if (loading) {
    return <div className="px-4 py-8 text-center text-neutral-600">Loading token balances...</div>;
  }

  const allTokens = [...(ethData ? [ethData] : []), ...tokenData];

  if (allTokens.length === 0) {
    return <div className="px-4 py-8 text-center text-neutral-500">No tokens found. Add tokens to see your portfolio.</div>;
  }

  return (
    <div className="divide-y divide-neutral-200">
      {allTokens.map((token, index) => {
        const isEth = !('address' in token);
        const key = isEth ? `ETH-${index}` : (token as TokenListItem).address;
        return (
          <div key={key} className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{token.symbol}</span>
                <span className="text-sm text-neutral-500">{token.name}</span>
              </div>
              <div className="mt-1 text-sm text-neutral-600">
                {parseFloat(token.balance).toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
              </div>
            </div>
            <div className="text-right">
              <div className="font-medium text-neutral-900">
                ${token.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {token.price > 0 && (
                <div className="text-sm text-neutral-500">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
