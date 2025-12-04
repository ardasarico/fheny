import { erc20Abi, formatUnits, getAddress, isAddress } from 'viem';
import { getActiveWallet } from './getActiveWallet';
import { getPublicClient } from './getClient';

export interface TokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
}

export async function getTokenBalance(tokenAddress: `0x${string}`): Promise<TokenInfo | null> {
  const active = getActiveWallet();
  if (!active) return null;

  try {
    if (!isAddress(tokenAddress)) {
      throw new Error('Invalid token address format');
    }

    const normalizedTokenAddress = getAddress(tokenAddress);
    const normalizedWalletAddress = getAddress(active.address);

    const publicClient = getPublicClient();

    // Fetch token info and balance in parallel
    const [balance, decimals, symbol, name] = await Promise.all([
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [normalizedWalletAddress],
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: erc20Abi,
        functionName: 'name',
      }),
    ]);

    const formattedBalance = formatUnits(balance as bigint, decimals as number);

    return {
      address: normalizedTokenAddress,
      name: name as string,
      symbol: symbol as string,
      decimals: decimals as number,
      balance: formattedBalance,
      balanceRaw: balance as bigint,
    };
  } catch (error) {
    console.error('Error fetching token balance:', error);
    throw error;
  }
}
