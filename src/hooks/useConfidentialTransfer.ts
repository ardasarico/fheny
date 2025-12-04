'use client';

// Hooks for confidential transfers on FHERC20 tokens

import { getFherc20TokenInfo } from '@/lib/fherc20/getIndicatedBalance';
import { getClient, getPublicClient } from '@/lib/getClient';
import { useWalletStore } from '@/store/useWalletStore';
import { useCallback, useState } from 'react';
import { getAddress, isAddress, parseUnits } from 'viem';
import { useFhenixCofhe } from './useFhenixCofhe';

// ABI for transfer with InEuint64 struct (encrypted input)
const CONFIDENTIAL_TRANSFER_ENCRYPTED_ABI = [
  {
    inputs: [
      { name: 'to', type: 'address' },
      {
        components: [
          { name: 'ctHash', type: 'uint256' },
          { name: 'securityZone', type: 'uint8' },
          { name: 'utype', type: 'uint8' },
          { name: 'signature', type: 'bytes' },
        ],
        name: 'inValue',
        type: 'tuple',
      },
    ],
    name: 'confidentialTransfer',
    outputs: [{ name: 'transferred', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface TransferState {
  isPending: boolean;
  isConfirming: boolean;
  isSuccess: boolean;
  error: string | null;
  hash: `0x${string}` | null;
}

interface UseConfidentialTransferResult extends TransferState {
  /**
   * Execute a confidential transfer
   * @param tokenAddress - The FHERC20 token contract address
   * @param to - The recipient address
   * @param amount - The amount to transfer (as a string, will be parsed with decimals)
   */
  transfer: (tokenAddress: `0x${string}`, to: `0x${string}`, amount: string) => Promise<{ hash: `0x${string}` } | null>;

  /**
   * Execute a confidential transfer with raw bigint amount
   * @param tokenAddress - The FHERC20 token contract address
   * @param to - The recipient address
   * @param amountRaw - The raw amount as bigint (already includes decimals)
   */
  transferRaw: (tokenAddress: `0x${string}`, to: `0x${string}`, amountRaw: bigint) => Promise<{ hash: `0x${string}` } | null>;

  /**
   * Reset the transfer state
   */
  reset: () => void;
}

const initialState: TransferState = {
  isPending: false,
  isConfirming: false,
  isSuccess: false,
  error: null,
  hash: null,
};

/**
 * Hook for executing confidential transfers on FHERC20 tokens
 *
 * This hook:
 * 1. Encrypts the transfer amount using cofhejs
 * 2. Calls confidentialTransfer on the token contract
 * 3. Handles transaction confirmation and errors
 */
export function useConfidentialTransfer(): UseConfidentialTransferResult {
  const [state, setState] = useState<TransferState>(initialState);
  const { isInitialized, initialize, cofhe } = useFhenixCofhe();
  const { wallets, activeWalletId } = useWalletStore();
  const activeWallet = wallets.find(w => w.id === activeWalletId) || null;

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const transferRaw = useCallback(
    async (tokenAddress: `0x${string}`, to: `0x${string}`, amountRaw: bigint): Promise<{ hash: `0x${string}` } | null> => {
      if (!activeWallet) {
        setState(prev => ({ ...prev, error: 'No active wallet' }));
        return null;
      }

      if (!isAddress(tokenAddress) || !isAddress(to)) {
        setState(prev => ({ ...prev, error: 'Invalid address format' }));
        return null;
      }

      setState({
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        error: null,
        hash: null,
      });

      try {
        // Initialize cofhejs if needed
        if (!isInitialized || !cofhe) {
          await initialize();
        }

        if (!cofhe) {
          throw new Error('cofhejs not initialized');
        }

        // Import Encryptable from cofhejs dynamically
        const cofhejsModule = await import('cofhejs/web');
        const { Encryptable } = cofhejsModule;

        // Encrypt the amount using cofhejs
        const encryptedResult = await cofhe.encrypt([Encryptable.uint64(amountRaw)]);

        if (!encryptedResult || !encryptedResult.data || encryptedResult.data.length === 0) {
          throw new Error('Failed to encrypt transfer amount');
        }

        // The encrypted data contains the InEuint64 struct
        const encryptedData = encryptedResult.data[0];

        // Get the wallet client
        const walletClient = getClient();
        const publicClient = getPublicClient();

        if (!walletClient) {
          throw new Error('Wallet client not available');
        }

        const normalizedTokenAddress = getAddress(tokenAddress);
        const normalizedTo = getAddress(to);

        // Execute the transfer with the encrypted struct
        // The encryptedData from cofhejs should be the InEuint64 struct
        const hash = await walletClient.writeContract({
          address: normalizedTokenAddress,
          abi: CONFIDENTIAL_TRANSFER_ENCRYPTED_ABI,
          functionName: 'confidentialTransfer',
          args: [
            normalizedTo,
            encryptedData as {
              ctHash: bigint;
              securityZone: number;
              utype: number;
              signature: `0x${string}`;
            },
          ],
        });

        setState(prev => ({
          ...prev,
          isPending: false,
          isConfirming: true,
          hash,
        }));

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
          setState(prev => ({
            ...prev,
            isConfirming: false,
            isSuccess: true,
          }));
          return { hash };
        } else {
          throw new Error('Transaction failed');
        }
      } catch (err) {
        console.error('Confidential transfer failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Transfer failed';
        setState({
          isPending: false,
          isConfirming: false,
          isSuccess: false,
          error: errorMessage,
          hash: null,
        });
        return null;
      }
    },
    [activeWallet, isInitialized, initialize, cofhe],
  );

  const transfer = useCallback(
    async (tokenAddress: `0x${string}`, to: `0x${string}`, amount: string): Promise<{ hash: `0x${string}` } | null> => {
      try {
        // Get token decimals
        const tokenInfo = await getFherc20TokenInfo(tokenAddress);

        // Parse amount with proper decimals
        const amountRaw = parseUnits(amount, tokenInfo.decimals);

        return transferRaw(tokenAddress, to, amountRaw);
      } catch (err) {
        console.error('Failed to parse transfer amount:', err);
        setState(prev => ({
          ...prev,
          error: err instanceof Error ? err.message : 'Failed to parse amount',
        }));
        return null;
      }
    },
    [transferRaw],
  );

  return {
    ...state,
    transfer,
    transferRaw,
    reset,
  };
}

/**
 * Hook for approving a spender on FHERC20 tokens
 */
export function useConfidentialApprove() {
  const [state, setState] = useState<TransferState>(initialState);
  const { isInitialized, initialize, cofhe } = useFhenixCofhe();
  const { wallets, activeWalletId } = useWalletStore();
  const activeWallet = wallets.find(w => w.id === activeWalletId) || null;

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const approve = useCallback(
    async (tokenAddress: `0x${string}`, spender: `0x${string}`, amount: string): Promise<{ hash: `0x${string}` } | null> => {
      if (!activeWallet) {
        setState(prev => ({ ...prev, error: 'No active wallet' }));
        return null;
      }

      if (!isAddress(tokenAddress) || !isAddress(spender)) {
        setState(prev => ({ ...prev, error: 'Invalid address format' }));
        return null;
      }

      setState({
        isPending: true,
        isConfirming: false,
        isSuccess: false,
        error: null,
        hash: null,
      });

      try {
        // Initialize cofhejs if needed
        if (!isInitialized || !cofhe) {
          await initialize();
        }

        if (!cofhe) {
          throw new Error('cofhejs not initialized');
        }

        // Get token decimals
        const tokenInfo = await getFherc20TokenInfo(tokenAddress);
        const amountRaw = parseUnits(amount, tokenInfo.decimals);

        // Import Encryptable from cofhejs dynamically
        const cofhejsModule = await import('cofhejs/web');
        const { Encryptable } = cofhejsModule;

        // Encrypt the amount
        const encryptedResult = await cofhe.encrypt([Encryptable.uint64(amountRaw)]);

        if (!encryptedResult || !encryptedResult.data || encryptedResult.data.length === 0) {
          throw new Error('Failed to encrypt approval amount');
        }

        const encryptedData = encryptedResult.data[0];

        // Get the wallet client
        const walletClient = getClient();
        const publicClient = getPublicClient();

        if (!walletClient) {
          throw new Error('Wallet client not available');
        }

        // FHERC20 approve ABI
        const APPROVE_ABI = [
          {
            inputs: [
              { name: 'spender', type: 'address' },
              {
                components: [
                  { name: 'ctHash', type: 'uint256' },
                  { name: 'securityZone', type: 'uint8' },
                  { name: 'utype', type: 'uint8' },
                  { name: 'signature', type: 'bytes' },
                ],
                name: 'inValue',
                type: 'tuple',
              },
            ],
            name: 'confidentialApprove',
            outputs: [{ name: '', type: 'bool' }],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ] as const;

        const normalizedTokenAddress = getAddress(tokenAddress);
        const normalizedSpender = getAddress(spender);

        // Execute the approval
        const hash = await walletClient.writeContract({
          address: normalizedTokenAddress,
          abi: APPROVE_ABI,
          functionName: 'confidentialApprove',
          args: [
            normalizedSpender,
            encryptedData as {
              ctHash: bigint;
              securityZone: number;
              utype: number;
              signature: `0x${string}`;
            },
          ],
        });

        setState(prev => ({
          ...prev,
          isPending: false,
          isConfirming: true,
          hash,
        }));

        // Wait for transaction confirmation
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
          setState(prev => ({
            ...prev,
            isConfirming: false,
            isSuccess: true,
          }));
          return { hash };
        } else {
          throw new Error('Approval transaction failed');
        }
      } catch (err) {
        console.error('Confidential approve failed:', err);
        const errorMessage = err instanceof Error ? err.message : 'Approval failed';
        setState({
          isPending: false,
          isConfirming: false,
          isSuccess: false,
          error: errorMessage,
          hash: null,
        });
        return null;
      }
    },
    [activeWallet, isInitialized, initialize, cofhe],
  );

  return {
    ...state,
    approve,
    reset,
  };
}
