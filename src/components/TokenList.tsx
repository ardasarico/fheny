'use client';

import { usePortfolio } from '@/hooks/usePortfolio';
import { TokenWithPrice } from '@/lib/calculateTotalValue';
import { useTokenStore } from '@/store/useTokenStore';
import { ConfidentialTokenListItem } from './ConfidentialTokenListItem';
import TokenLogo from './TokenLogo';

import IconCoins from '@icon/coins.svg';

interface EthListItem {
  symbol: string;
  name: string;
  balance: string;
  price: number;
  usdValue: number;
}

type TokenListItem = TokenWithPrice;

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
        <IconCoins className="h-8 w-8 text-neutral-400" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-neutral-800">No tokens yet</h3>
      <p className="max-w-xs text-sm text-neutral-500">Add tokens to track your portfolio</p>
    </div>
  );
}

export default function TokenList() {
  const { data, isLoading } = usePortfolio();
  const { getConfidentialTokens } = useTokenStore();
  const confidentialTokens = getConfidentialTokens();

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
    return <EmptyState />;
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
    return <EmptyState />;
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
                <div className="text-sm text-neutral-500">${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</div>
              )}
            </div>
          </div>
        );
      })}

      {/* Confidential FHERC20 Tokens */}
      {confidentialTokens.map(token => (
        <ConfidentialTokenListItem key={token.address} token={token} />
      ))}
    </div>
  );
}
