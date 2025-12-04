'use client';

import { getEncryptedBalance } from '@/lib/fherc20/encryptedBalance';
import { getFherc20TokenInfo, getIndicatedBalance } from '@/lib/fherc20/getIndicatedBalance';
import { useWalletStore } from '@/store/useWalletStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatUnits } from 'viem';
import { FheTypesEnum, useFhenixCofhe } from './useFhenixCofhe';

interface UseConfidentialBalanceResult {
  /** The decrypted balance as a formatted string (e.g., "100.5") */
  balance: string | null;
  /** The raw decrypted balance as bigint */
  balanceRaw: bigint | null;
  /** The indicated balance (public hint, 0.0000-0.9999) */
  indicatedBalance: string | null;
  /** Token decimals */
  decimals: number;
  /** Whether the balance is currently being loaded/decrypted */
  isLoading: boolean;
  /** Whether decryption is in progress (after encrypted balance is fetched) */
  isDecrypting: boolean;
  /** Error message if something failed */
  error: string | null;
  /** Refresh the balance */
  refetch: () => void;
}

/**
 * Hook to get and decrypt the confidential balance of an FHERC20 token
 *
 * This hook:
 * 1. Fetches the encrypted balance from the blockchain
 * 2. Gets or creates a permit for unsealing
 * 3. Decrypts (unseals) the balance using cofhejs
 *
 * @param tokenAddress - The FHERC20 token contract address
 * @param walletAddress - Optional wallet address (uses active wallet if not provided)
 * @returns Object containing balance, loading states, and error
 */
export function useConfidentialBalance(tokenAddress: `0x${string}` | null, walletAddress?: `0x${string}`): UseConfidentialBalanceResult {
  const [balance, setBalance] = useState<string | null>(null);
  const [balanceRaw, setBalanceRaw] = useState<bigint | null>(null);
  const [indicatedBalance, setIndicatedBalance] = useState<string | null>(null);
  const [decimals, setDecimals] = useState<number>(18);
  const [isLoading, setIsLoading] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isInitialized, createPermit, unseal, initialize, error: cofheError } = useFhenixCofhe();
  const { wallets, activeWalletId } = useWalletStore();
  const activeWallet = wallets.find(w => w.id === activeWalletId) || null;

  const effectiveAddress = walletAddress || activeWallet?.address;
  const fetchInProgress = useRef(false);

  const fetchBalance = useCallback(async () => {
    if (!tokenAddress || !effectiveAddress) {
      setBalance(null);
      setBalanceRaw(null);
      setIndicatedBalance(null);
      setError(null);
      return;
    }

    // Prevent concurrent fetches
    if (fetchInProgress.current) {
      return;
    }

    fetchInProgress.current = true;
    setIsLoading(true);
    setError(null);

    try {
      // Initialize cofhejs if not already done
      if (!isInitialized) {
        await initialize();
      }

      // Fetch token info and indicated balance in parallel
      const [tokenInfo, indicated] = await Promise.all([
        getFherc20TokenInfo(tokenAddress),
        getIndicatedBalance(tokenAddress, effectiveAddress as `0x${string}`),
      ]);

      setDecimals(tokenInfo.decimals);
      setIndicatedBalance(indicated);

      // Fetch encrypted balance
      const encryptedBalance = await getEncryptedBalance(tokenAddress, effectiveAddress as `0x${string}`);

      if (encryptedBalance === 0n) {
        // Zero balance, no need to decrypt
        setBalance('0');
        setBalanceRaw(0n);
        setIsLoading(false);
        fetchInProgress.current = false;
        return;
      }

      // Now decrypt the balance
      setIsDecrypting(true);

      // Create or get permit for the wallet
      const permit = await createPermit(effectiveAddress);

      if (!permit) {
        throw new Error('Failed to create permit for unsealing');
      }

      // Unseal the encrypted balance
      const unsealedBalance = await unseal(encryptedBalance, FheTypesEnum.Uint64, permit.data.issuer, permit.data.getHash());

      if (unsealedBalance === null) {
        throw new Error('Failed to unseal balance');
      }

      // Format the balance
      const formattedBalance = formatUnits(unsealedBalance, tokenInfo.decimals);

      setBalance(formattedBalance);
      setBalanceRaw(unsealedBalance);
    } catch (err) {
      console.error('Failed to fetch confidential balance:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(errorMessage);
      setBalance(null);
      setBalanceRaw(null);
    } finally {
      setIsLoading(false);
      setIsDecrypting(false);
      fetchInProgress.current = false;
    }
  }, [tokenAddress, effectiveAddress, isInitialized, initialize, createPermit, unseal]);

  // Fetch balance when dependencies change
  useEffect(() => {
    if (tokenAddress && effectiveAddress) {
      fetchBalance();
    }
  }, [tokenAddress, effectiveAddress, isInitialized]);

  // Handle cofhejs errors
  useEffect(() => {
    if (cofheError && !error) {
      setError(`cofhejs error: ${cofheError}`);
    }
  }, [cofheError, error]);

  const refetch = useCallback(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    balanceRaw,
    indicatedBalance,
    decimals,
    isLoading,
    isDecrypting,
    error,
    refetch,
  };
}
