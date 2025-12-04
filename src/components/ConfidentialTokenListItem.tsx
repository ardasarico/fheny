'use client';

import { useConfidentialBalance } from '@/hooks/useConfidentialBalance';
import { Token } from '@/store/useTokenStore';
import { useState } from 'react';
import { ConfidentialBadge, ConfidentialIcon } from './ConfidentialBalanceDisplay';
import { ConfidentialTransferForm } from './ConfidentialTransferForm';

interface ConfidentialTokenListItemProps {
  token: Token;
}

/**
 * List item component for displaying a confidential (FHERC20) token
 * Shows decrypted balance with loading state and send functionality
 */
export function ConfidentialTokenListItem({ token }: ConfidentialTokenListItemProps) {
  const [showSendModal, setShowSendModal] = useState(false);
  const { balance, indicatedBalance, isLoading, isDecrypting, error, refetch } = useConfidentialBalance(token.address);

  return (
    <>
      <div className="flex cursor-pointer items-center justify-between px-4 py-3 hover:bg-purple-50/50" onClick={() => setShowSendModal(true)}>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <ConfidentialIcon className="h-4 w-4" />
            <span className="font-medium text-neutral-900">{token.symbol}</span>
            <span className="text-sm text-neutral-500">{token.name}</span>
            <ConfidentialBadge className="ml-1" />
          </div>

          {/* Balance display */}
          <div className="mt-1">
            {isLoading || isDecrypting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-20 animate-pulse rounded bg-neutral-200" />
                <span className="text-xs text-purple-600">{isDecrypting ? 'Decrypting...' : 'Loading...'}</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-red-500">Error loading balance</span>
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
              <div className="text-sm text-neutral-600">
                {parseFloat(balance || '0').toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}
              </div>
            )}
          </div>
        </div>

        <div className="text-right">
          {/* Indicated balance hint */}
          {indicatedBalance && !error && (
            <div className="text-xs text-neutral-400" title="Public indicator value">
              ~{indicatedBalance}
            </div>
          )}

          {/* Send button */}
          <button
            onClick={e => {
              e.stopPropagation();
              setShowSendModal(true);
            }}
            className="mt-1 rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-800 transition-colors hover:bg-purple-200"
          >
            Send
          </button>
        </div>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSendModal(false)}>
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl" onClick={e => e.stopPropagation()}>
            <ConfidentialTransferForm
              tokenAddress={token.address}
              tokenSymbol={token.symbol}
              tokenDecimals={token.decimals}
              onSuccess={() => {
                // Refresh balance after successful transfer
                setTimeout(() => refetch(), 2000);
              }}
              onClose={() => setShowSendModal(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
