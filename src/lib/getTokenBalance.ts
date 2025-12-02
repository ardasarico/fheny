import { getPublicClient } from './getClient';
import { getActiveWallet } from './getActiveWallet';
import { getAddress, isAddress, formatUnits } from 'viem';

// ERC-20 Token ABI (sadece balanceOf ve decimals için)
const ERC20_ABI = [
  {
    constant: true,
    inputs: [{ name: '_owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', type: 'uint256' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', type: 'uint8' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'name',
    outputs: [{ name: '', type: 'string' }],
    type: 'function',
  },
] as const;

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
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [normalizedWalletAddress],
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }),
      publicClient.readContract({
        address: normalizedTokenAddress,
        abi: ERC20_ABI,
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

