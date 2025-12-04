'use client';

import { useConfidentialBalance } from '@/hooks/useConfidentialBalance';
import { TokenType } from '@/lib/fherc20/types';

interface ConfidentialBalanceDisplayProps {
  tokenAddress: `0x${string}`;
  tokenType: TokenType;
  symbol: string;
}

/**
 * Component to display the balance of a confidential (FHERC20) token
 * Shows a skeleton while decrypting and the decrypted balance once available
 */
export function ConfidentialBalanceDisplay({ tokenAddress, tokenType, symbol }: ConfidentialBalanceDisplayProps) {
  const { balance, indicatedBalance, isLoading, isDecrypting, error } = useConfidentialBalance(tokenAddress);

  if (tokenType !== 'FHERC20') {
    return null;
  }

  return (
    <div className="flex flex-col">
      {/* Main balance display */}
      <div className="flex items-center gap-2">
        {isLoading || isDecrypting ? (
          <div className="flex items-center gap-2">
            <BalanceSkeleton />
            <span className="text-xs text-neutral-500">Decrypting...</span>
          </div>
        ) : error ? (
          <span className="text-sm text-red-500" title={error}>
            Error loading balance
          </span>
        ) : (
          <span className="text-sm text-neutral-600">
            {parseFloat(balance || '0').toLocaleString(undefined, {
              maximumFractionDigits: 6,
            })}
          </span>
        )}
      </div>

      {/* Indicated balance hint */}
      {indicatedBalance && (
        <div className="mt-0.5 text-xs text-neutral-400" title="Public indicator (not actual balance)">
          Indicator: {indicatedBalance}
        </div>
      )}
    </div>
  );
}

/**
 * Skeleton loader for balance while decrypting
 */
function BalanceSkeleton() {
  return (
    <div className="flex items-center gap-1">
      <div className="h-4 w-16 animate-pulse rounded bg-neutral-200" />
    </div>
  );
}

/**
 * Badge to indicate a token is confidential
 */
export function ConfidentialBadge({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-800 ${className}`}>
      <svg className="mr-1 h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
        />
      </svg>
      Confidential
    </span>
  );
}

/**
 * Lock icon for confidential tokens
 */
export function ConfidentialIcon({ className = '' }: { className?: string }) {
  return (
    <svg className={`h-4 w-4 text-purple-600 ${className}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}
