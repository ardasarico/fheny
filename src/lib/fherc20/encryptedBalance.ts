import { getAddress, isAddress } from 'viem';
import { getActiveWallet } from '../getActiveWallet';
import { getPublicClient } from '../getClient';

// Simple ABI for reading confidential balance
const CONFIDENTIAL_BALANCE_ABI = [
  {
    inputs: [{ name: 'account', type: 'address' }],
    name: 'confidentialBalanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

/**
 * Get the encrypted balance (euint64 handle) for an FHERC20 token
 *
 * This returns the raw encrypted handle from the blockchain.
 * To get the actual balance, you need to unseal it using cofhejs.
 *
 * @param tokenAddress - The FHERC20 token contract address
 * @param userAddress - The user's wallet address (optional, uses active wallet if not provided)
 * @returns The encrypted balance handle as a bigint
 */
export async function getEncryptedBalance(tokenAddress: `0x${string}`, userAddress?: `0x${string}`): Promise<bigint> {
  const address = userAddress ?? getActiveWallet()?.address;

  if (!address) {
    throw new Error('No wallet address available');
  }

  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid token address format');
  }

  const normalizedTokenAddress = getAddress(tokenAddress);
  const normalizedUserAddress = getAddress(address);

  const publicClient = getPublicClient();

  try {
    const encryptedBalance = await publicClient.readContract({
      address: normalizedTokenAddress,
      abi: CONFIDENTIAL_BALANCE_ABI,
      functionName: 'confidentialBalanceOf',
      args: [normalizedUserAddress],
    });

    return encryptedBalance as bigint;
  } catch (error) {
    console.error('Error fetching encrypted balance:', error);
    throw error;
  }
}
