'use client';

import { detectTokenType } from '@/lib/fherc20/detectTokenType';
import { TokenType } from '@/lib/fherc20/types';
import { useCallback, useEffect, useState } from 'react';

interface UseTokenTypeResult {
  tokenType: TokenType | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Cache for token types to avoid repeated calls
const tokenTypeCache = new Map<string, TokenType>();

/**
 * Hook to detect whether a token is ERC20 or FHERC20
 *
 * @param tokenAddress - The token contract address
 * @returns Object containing tokenType, loading state, and error
 */
export function useTokenType(tokenAddress: `0x${string}` | null): UseTokenTypeResult {
  const [tokenType, setTokenType] = useState<TokenType | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenType = useCallback(async () => {
    if (!tokenAddress) {
      setTokenType(null);
      setError(null);
      return;
    }

    const normalizedAddress = tokenAddress.toLowerCase();

    // Check cache first
    const cached = tokenTypeCache.get(normalizedAddress);
    if (cached) {
      setTokenType(cached);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const type = await detectTokenType(tokenAddress);

      // Cache the result
      tokenTypeCache.set(normalizedAddress, type);

      setTokenType(type);
    } catch (err) {
      console.error('Failed to detect token type:', err);
      setError(err instanceof Error ? err.message : 'Failed to detect token type');
      // Default to ERC20 on error
      setTokenType('ERC20');
    } finally {
      setIsLoading(false);
    }
  }, [tokenAddress]);

  useEffect(() => {
    fetchTokenType();
  }, [fetchTokenType]);

  const refetch = useCallback(() => {
    if (tokenAddress) {
      // Clear cache for this address
      tokenTypeCache.delete(tokenAddress.toLowerCase());
    }
    fetchTokenType();
  }, [tokenAddress, fetchTokenType]);

  return {
    tokenType,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Get cached token type synchronously if available
 *
 * @param tokenAddress - The token contract address
 * @returns The cached token type or null if not cached
 */
export function getCachedTokenType(tokenAddress: string): TokenType | null {
  return tokenTypeCache.get(tokenAddress.toLowerCase()) || null;
}

/**
 * Clear the token type cache
 */
export function clearTokenTypeCache(): void {
  tokenTypeCache.clear();
}
