'use client';

import { useConfidentialBalance } from '@/hooks/useConfidentialBalance';
import { Token } from '@/store/useTokenStore';
import TokenLogo from './TokenLogo';

interface ConfidentialTokenListItemProps {
  token: Token;
  handleTokenClick: (tokenAddress?: `0x${string}`) => void;
}

/**
 * List item component for displaying a confidential (FHERC20) token
 * Shows decrypted balance with loading state and send functionality
 */
export function ConfidentialTokenListItem({ token, handleTokenClick }: ConfidentialTokenListItemProps) {
  const { balance, isLoading, isDecrypting, error, refetch } = useConfidentialBalance(token.address);

  return (
    <>
      <div className="flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-neutral-300" onClick={() => handleTokenClick(token.address)}>
        <TokenLogo symbol={token.symbol} address={token.address} />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-neutral-900">{token.symbol}</span>
            <span className="text-sm text-neutral-500">{token.name}</span>
            <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">🔐</span>
          </div>

          {/* Balance display */}
          <div className="mt-0.5 text-sm text-neutral-600">
            {isLoading || isDecrypting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
                <span className="text-xs text-purple-600">{isDecrypting ? 'Decrypting...' : 'Loading...'}</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <span className="text-red-500">Error</span>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    refetch();
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              parseFloat(balance || '0').toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })
            )}
          </div>
        </div>

        <div className="text-right">
          {/* Show placeholder for USD value since confidential tokens don't have price data */}
          <div className="font-medium text-neutral-400">—</div>
          <div className="text-sm text-neutral-400">No price data</div>
        </div>
      </div>
    </>
  );
}
