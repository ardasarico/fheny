'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { TokenWithPrice } from '@/lib/calculateTotalValue';
import TokenLogo from './TokenLogo';

interface EthListItem {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  usdValue: number;
}

type TokenListItem = TokenWithPrice;

export default function TokenList() {
  const { data, isLoading } = usePortfolio();

  if (isLoading) {
    return (
      <div className="divide-y divide-neutral-200">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex animate-pulse items-center gap-3 px-4 py-3">
            <div className="h-10 w-10 rounded-full bg-neutral-200" />
            <div className="flex-1">
              <div className="mb-1 h-4 w-20 rounded bg-neutral-200" />
              <div className="h-3 w-16 rounded bg-neutral-200" />
            </div>
            <div className="text-right">
              <div className="mb-1 h-4 w-16 rounded bg-neutral-200" />
              <div className="h-3 w-12 rounded bg-neutral-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return <div className="px-4 py-8 text-center text-neutral-500">No tokens found. Add tokens to see your portfolio.</div>;
  }

  // Build ETH item if we have ETH data
  const ethItem: EthListItem | null =
    data.ethBalance && parseFloat(data.ethBalance) > 0
      ? {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: data.ethBalance,
          price: data.ethPrice,
          usdValue: data.ethUsdValue,
        }
      : null;

  const allTokens = [...(ethItem ? [ethItem] : []), ...data.tokens].sort((a, b) => b.usdValue - a.usdValue);

  if (allTokens.length === 0) {
    return <div className="px-4 py-8 text-center text-neutral-500">No tokens found. Add tokens to see your portfolio.</div>;
  }

  return (
    <div className="divide-y divide-neutral-200">
      {allTokens.map((token, index) => {
        const isEth = !('address' in token);
        const key = isEth ? `ETH-${index}` : (token as TokenListItem).address;
        const tokenAddress = isEth ? undefined : (token as TokenListItem).address;

        return (
          <div key={key} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50">
            <TokenLogo symbol={token.symbol} address={tokenAddress} />

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-neutral-900">{token.symbol}</span>
                <span className="text-sm text-neutral-500">{token.name}</span>
              </div>
              <div className="mt-0.5 text-sm text-neutral-600">
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
                <div className="text-sm text-neutral-500">
                  ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
