import { formatUnits, getAddress, isAddress } from 'viem';
import { getActiveWallet } from '../getActiveWallet';
import { getPublicClient } from '../getClient';
import { FHERC20_ABI } from './abi';

/**
 * Get the "indicated balance" for an FHERC20 token
 *
 * The indicated balance is the public hint returned by balanceOf()
 * It's a value between 0.0000 and 0.9999 that gives a rough indication
 * of balance without revealing the actual amount.
 *
 * @param tokenAddress - The FHERC20 token contract address
 * @param userAddress - The user's wallet address (optional, uses active wallet if not provided)
 * @returns The indicated balance as a string (e.g., "0.1234")
 */
export async function getIndicatedBalance(tokenAddress: `0x${string}`, userAddress?: `0x${string}`): Promise<string> {
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
    const balance = await publicClient.readContract({
      address: normalizedTokenAddress,
      abi: FHERC20_ABI,
      functionName: 'balanceOf',
      args: [normalizedUserAddress],
    });

    // The indicated balance is typically stored in a small range
    // Format it with 4 decimals to show the "hint" value
    const formattedBalance = formatUnits(balance as bigint, 4);

    return formattedBalance;
  } catch (error) {
    console.error('Error fetching indicated balance:', error);
    throw error;
  }
}

/**
 * Get basic token info from an FHERC20 contract
 *
 * @param tokenAddress - The FHERC20 token contract address
 * @returns Token metadata (name, symbol, decimals)
 */
export async function getFherc20TokenInfo(tokenAddress: `0x${string}`): Promise<{
  name: string;
  symbol: string;
  decimals: number;
}> {
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid token address format');
  }

  const normalizedTokenAddress = getAddress(tokenAddress);
  const publicClient = getPublicClient();

  const [name, symbol, decimals] = await Promise.all([
    publicClient.readContract({
      address: normalizedTokenAddress,
      abi: FHERC20_ABI,
      functionName: 'name',
    }),
    publicClient.readContract({
      address: normalizedTokenAddress,
      abi: FHERC20_ABI,
      functionName: 'symbol',
    }),
    publicClient.readContract({
      address: normalizedTokenAddress,
      abi: FHERC20_ABI,
      functionName: 'decimals',
    }),
  ]);

  return {
    name: name as string,
    symbol: symbol as string,
    decimals: decimals as number,
  };
}
