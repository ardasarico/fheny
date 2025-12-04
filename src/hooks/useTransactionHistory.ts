import { useQuery } from '@tanstack/react-query';
import type { Transaction } from '@/types/transaction';

interface TransactionResponse {
  transactions: Transaction[];
  count: number;
}

async function fetchTransactions(address: string, maxCount = 50): Promise<Transaction[]> {
  const response = await fetch(
    `/api/transactions?address=${address}&maxCount=${maxCount}`,
  );

  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }

  const data: TransactionResponse = await response.json();
  return data.transactions;
}

export function useTransactionHistory(address: string | undefined, maxCount = 50) {
  return useQuery({
    queryKey: ['transactions', address, maxCount],
    queryFn: () => fetchTransactions(address!, maxCount),
    enabled: !!address,
    // Cache for 2 minutes (transactions change less frequently)
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 10 minutes
    gcTime: 10 * 60 * 1000,
  });
}

// Helper functions (re-exported for UI)
export function shortenAddress(address: string, chars = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

export function formatTransactionDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

