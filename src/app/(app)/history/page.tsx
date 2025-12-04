'use client';

import TokenLogo from '@/components/TokenLogo';
import { formatTransactionDate, shortenAddress, useTransactionHistory } from '@/hooks/useTransactionHistory';
import { useWalletStore } from '@/store/useWalletStore';
import type { Transaction } from '@/types/transaction';

import IconAlertTriangle from '@icon/alert-triangle.svg';
import IconDocument from '@icon/document.svg';
import IconWallet from '@icon/wallet.svg';

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
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-neutral-100 to-neutral-200">
        <IconDocument className="h-12 w-12 text-neutral-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-800">No transactions yet</h3>
      <p className="max-w-xs text-sm text-neutral-500">
        Once you send or receive tokens, your transaction history will appear here.
      </p>
    </div>
  );
}

// Error state
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-red-50 to-red-100">
        <IconAlertTriangle className="h-12 w-12 text-red-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-800">Something went wrong</h3>
      <p className="mb-6 max-w-xs text-sm text-neutral-500">We couldn&apos;t load your transaction history. Please try again.</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-neutral-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-neutral-800"
      >
        Try Again
      </button>
    </div>
  );
}

// No wallet state
function NoWalletState() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100">
        <IconWallet className="h-12 w-12 text-blue-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-800">No wallet connected</h3>
      <p className="max-w-xs text-sm text-neutral-500">Create or import a wallet to view your transaction history.</p>
    </div>
  );
}

const Page = () => {
  // Use selector to prevent re-renders when other wallet properties change
  const activeWallet = useWalletStore(state => state.wallets.find(w => w.id === state.activeWalletId));

  const { data: transactions = [], isLoading, isError, refetch } = useTransactionHistory(activeWallet?.address);

  // No wallet connected
  if (!activeWallet) {
    return <NoWalletState />;
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
