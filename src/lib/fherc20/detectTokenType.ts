import { getAddress, isAddress } from 'viem';
import { getPublicClient } from '../getClient';
import { FHERC20_ABI } from './abi';
import type { TokenType } from './types';

/**
 * Detect whether a token contract is FHERC20 or standard ERC-20
 *
 * Strategy:
 * 1. Call isFherc20() function
 * 2. If it exists and returns true => FHERC20
 * 3. Otherwise fallback to standard ERC-20
 *
 * @param tokenAddress - The token contract address
 * @returns TokenType - Either 'FHERC20' or 'ERC20'
 */
export async function detectTokenType(tokenAddress: string): Promise<TokenType> {
  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid token address format');
  }

  const normalizedAddress = getAddress(tokenAddress) as `0x${string}`;
  const publicClient = getPublicClient();

  try {
    // Try to call isFherc20() function
    const isFherc20 = await publicClient.readContract({
      address: normalizedAddress,
      abi: FHERC20_ABI,
      functionName: 'isFherc20',
    });

    if (isFherc20 === true) {
      return 'FHERC20';
    }

    return 'ERC20';
  } catch (error) {
    // If the function doesn't exist or reverts, it's a standard ERC-20
    console.debug('isFherc20() check failed, assuming ERC-20:', error);
    return 'ERC20';
  }
}

/**
 * Batch detect token types for multiple addresses
 *
 * @param tokenAddresses - Array of token contract addresses
 * @returns Map of address to TokenType
 */
export async function detectTokenTypes(tokenAddresses: string[]): Promise<Map<string, TokenType>> {
  const results = new Map<string, TokenType>();

  // Process in parallel with error handling for each
  const detectionPromises = tokenAddresses.map(async address => {
    try {
      const tokenType = await detectTokenType(address);
      return { address: address.toLowerCase(), tokenType };
    } catch (error) {
      console.error(`Failed to detect token type for ${address}:`, error);
      // Default to ERC20 on error
      return { address: address.toLowerCase(), tokenType: 'ERC20' as TokenType };
    }
  });

  const detectionResults = await Promise.all(detectionPromises);

  for (const { address, tokenType } of detectionResults) {
    results.set(address, tokenType);
  }

  return results;
}
