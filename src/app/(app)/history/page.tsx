'use client';

import TokenLogo from '@/components/TokenLogo';
import { formatTransactionDate, shortenAddress, useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useWalletStore } from '@/store/useWalletStore';
import type { Transaction } from '@/types/transaction';

// Transaction item component
function TransactionItem({ tx }: { tx: Transaction }) {
  const isReceived = tx.direction === 'in';
  const otherAddress = isReceived ? tx.from : tx.to;

  // Determine display text based on direction
  const actionText = isReceived ? 'Received from' : 'Sent to';

  // Format value with proper decimals
  const formattedValue = parseFloat(tx.value).toFixed(tx.value.includes('.') ? Math.min(tx.value.split('.')[1]?.length || 4, 6) : 0);

  return (
    <div className="flex w-full items-center gap-3">
      {/* Token Logo */}
      <TokenLogo symbol={tx.asset} address={tx.contractAddress} size="lg" />

      {/* Info */}
      <div className="flex flex-col">
        <p className="font-medium">
          {actionText} {shortenAddress(otherAddress)}
        </p>
        <p className="text-sm text-neutral-500">
          {tx.tokenName || tx.asset} • {formatTransactionDate(tx.timestamp)}
        </p>
      </div>

      {/* Amount */}
      <p className={`ml-auto text-xl font-semibold ${isReceived ? 'text-[#00B100]' : 'text-neutral-600'}`}>
        {isReceived ? '+' : '-'} {formattedValue} {tx.asset}
      </p>
    </div>
  );
}

// Loading skeleton
function TransactionSkeleton() {
  return (
    <div className="flex w-full animate-pulse items-center gap-3">
      <div className="h-14 w-14 rounded-full bg-neutral-200" />
      <div className="flex flex-col gap-2">
        <div className="h-4 w-32 rounded bg-neutral-200" />
        <div className="h-3 w-24 rounded bg-neutral-200" />
      </div>
      <div className="ml-auto h-6 w-24 rounded bg-neutral-200" />
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
        <span className="text-4xl">📜</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-800">No transactions yet</h3>
        <p className="text-sm text-neutral-500">Your transaction history will appear here</p>
      </div>
    </div>
  );
}

// Error state
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <span className="text-4xl">⚠️</span>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-neutral-800">Failed to load history</h3>
        <p className="text-sm text-neutral-500">Please check your connection and try again</p>
      </div>
      <button onClick={onRetry} className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-800">
        Try Again
      </button>
    </div>
  );
}

const Page = () => {
  // Use selector to prevent re-renders when other wallet properties change
  const activeWallet = useWalletStore(state => state.wallets.find(w => w.id === state.activeWalletId));

  const { data: transactions = [], isLoading, isError, refetch } = useTransactionHistory(activeWallet?.address);

  // No wallet connected
  if (!activeWallet) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100">
          <span className="text-4xl">👛</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-neutral-800">No wallet connected</h3>
          <p className="text-sm text-neutral-500">Connect a wallet to view your transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-y-auto px-4 py-8">
      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col gap-8">
          {[...Array(5)].map((_, i) => (
            <TransactionSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && isError && <ErrorState onRetry={() => refetch()} />}

      {/* Empty state */}
      {!isLoading && !isError && transactions.length === 0 && <EmptyState />}

      {/* Transaction list */}
      {!isLoading && !isError && transactions.length > 0 && (
        <div className="flex flex-col gap-6">
          {transactions.map(tx => (
            <TransactionItem key={tx.hash} tx={tx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Page;
