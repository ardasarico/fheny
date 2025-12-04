import { getAddress, isAddress, parseEther, parseUnits } from 'viem';
import { getActiveWallet } from './getActiveWallet';
import { getClient, getPublicClient } from './getClient';

// ERC-20 Transfer ABI
const ERC20_TRANSFER_ABI = [
  {
    name: 'transfer',
    type: 'function',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;

export interface SendTokenParams {
  to: `0x${string}`;
  amount: string;
  tokenAddress?: `0x${string}`; // undefined = native ETH
  decimals?: number; // required for ERC20
}

export interface SendTokenResult {
  hash: `0x${string}`;
  from: `0x${string}`;
  to: `0x${string}`;
  amount: string;
  tokenAddress?: `0x${string}`;
}

/**
 * Send native ETH or ERC20 tokens
 */
export async function sendToken(params: SendTokenParams): Promise<SendTokenResult> {
  const { to, amount, tokenAddress, decimals } = params;

  const activeWallet = getActiveWallet();
  if (!activeWallet) {
    throw new Error('No active wallet found');
  }

  const walletClient = getClient();
  if (!walletClient) {
    throw new Error('Failed to create wallet client');
  }

  // Validate recipient address
  if (!isAddress(to)) {
    throw new Error('Invalid recipient address');
  }

  const normalizedTo = getAddress(to);

  // Native ETH transfer
  if (!tokenAddress) {
    const value = parseEther(amount);

    const hash = await walletClient.sendTransaction({
      to: normalizedTo,
      value,
    });

    return {
      hash,
      from: activeWallet.address,
      to: normalizedTo,
      amount,
    };
  }

  // ERC20 token transfer
  if (!decimals) {
    throw new Error('Decimals required for ERC20 transfer');
  }

  if (!isAddress(tokenAddress)) {
    throw new Error('Invalid token address');
  }

  const normalizedTokenAddress = getAddress(tokenAddress);
  const tokenAmount = parseUnits(amount, decimals);

  const hash = await walletClient.writeContract({
    address: normalizedTokenAddress,
    abi: ERC20_TRANSFER_ABI,
    functionName: 'transfer',
    args: [normalizedTo, tokenAmount],
  });

  return {
    hash,
    from: activeWallet.address,
    to: normalizedTo,
    amount,
    tokenAddress: normalizedTokenAddress,
  };
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(hash: `0x${string}`) {
  const publicClient = getPublicClient();

  const receipt = await publicClient.waitForTransactionReceipt({
    hash,
    confirmations: 1,
  });

  return receipt;
}
