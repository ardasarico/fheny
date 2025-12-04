'use client';

import { useCallback, useEffect, useState } from 'react';
import { formatUnits } from 'viem';
import { FheTypesEnum, useFhenixCofhe } from './useFhenixCofhe';

interface UseDecryptTransactionValueResult {
  /** The decrypted value as a formatted string */
  decryptedValue: string | null;
  /** Whether decryption is in progress */
  isDecrypting: boolean;
  /** Error message if decryption failed */
  error: string | null;
  /** Trigger decryption manually */
  decrypt: () => void;
}

/**
 * Hook to decrypt an encrypted transaction value from a confidential token transfer
 *
 * @param encryptedValue - The encrypted value as a hex string or bigint
 * @param decimals - Token decimals for formatting
 * @param contractAddress - The FHERC20 token contract address (used as issuer)
 * @param autoDecrypt - Whether to automatically decrypt on mount (default: true)
 */
export function useDecryptTransactionValue(
  encryptedValue: string | bigint | undefined,
  decimals: number = 18,
  contractAddress?: string,
  autoDecrypt: boolean = true,
): UseDecryptTransactionValueResult {
  const [decryptedValue, setDecryptedValue] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { isInitialized, createPermit, unseal, initialize } = useFhenixCofhe();

  const decrypt = useCallback(async () => {
    if (!encryptedValue || !contractAddress) {
      return;
    }

    setIsDecrypting(true);
    setError(null);

    try {
      // Initialize cofhejs if needed
      if (!isInitialized) {
        await initialize();
      }

      // Convert to bigint if string
      const valueBigInt = typeof encryptedValue === 'string' ? BigInt(encryptedValue) : encryptedValue;

      if (valueBigInt === 0n) {
        setDecryptedValue('0');
        setIsDecrypting(false);
        return;
      }

      // Create permit for the contract
      const permit = await createPermit(contractAddress);

      if (!permit) {
        throw new Error('Failed to create permit for unsealing');
      }

      // Unseal the encrypted value
      const unsealed = await unseal(valueBigInt, FheTypesEnum.Uint64, permit.data.issuer, permit.data.getHash());

      if (unsealed === null) {
        throw new Error('Failed to unseal value');
      }

      // Format the value with decimals
      const formatted = formatUnits(unsealed, decimals);
      setDecryptedValue(formatted);
    } catch (err) {
      console.error('Failed to decrypt transaction value:', err);
      setError(err instanceof Error ? err.message : 'Decryption failed');
    } finally {
      setIsDecrypting(false);
    }
  }, [encryptedValue, decimals, contractAddress, isInitialized, initialize, createPermit, unseal]);

  // Auto-decrypt on mount if enabled
  useEffect(() => {
    if (autoDecrypt && encryptedValue && contractAddress && !decryptedValue && !isDecrypting) {
      decrypt();
    }
  }, [autoDecrypt, encryptedValue, contractAddress, decryptedValue, isDecrypting, decrypt]);

  return {
    decryptedValue,
    isDecrypting,
    error,
    decrypt,
  };
}
