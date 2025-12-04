import { calculateTotalValueWithTokens, TotalValueResult } from '@/lib/calculateTotalValue';
import { useTokenStore } from '@/store/useTokenStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useQuery } from '@tanstack/react-query';

const TEN_MINUTES_MS = 10 * 60 * 1000;

/**
 * Shared hook for portfolio data - used by both TokenList and BalanceSection
 * Prevents duplicate API calls by using React Query's caching
 */
export function usePortfolio() {
  const tokens = useTokenStore(state => state.tokens).filter(t => t.tokenType === 'ERC20' || !t.tokenType);
  const activeWalletId = useWalletStore(state => state.activeWalletId);

  // Create a stable key from token addresses
  const tokenKey = tokens
    .map(t => t.address.toLowerCase())
    .sort()
    .join(',');

  return useQuery<TotalValueResult>({
    queryKey: ['portfolio', activeWalletId, tokenKey],
    queryFn: () => calculateTotalValueWithTokens(tokens.map(t => t.address)),
    enabled: !!activeWalletId,
    staleTime: TEN_MINUTES_MS,
    gcTime: TEN_MINUTES_MS * 2,
    refetchInterval: TEN_MINUTES_MS,
  });
}
