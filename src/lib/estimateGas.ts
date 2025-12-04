import { formatEther, getAddress, isAddress, parseEther, parseUnits, encodeFunctionData } from 'viem';
import { getActiveWallet } from './getActiveWallet';
import { getPublicClient } from './getClient';

// ERC-20 Transfer ABI for encoding
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

export interface EstimateGasParams {
  to: `0x${string}`;
  amount: string;
  tokenAddress?: `0x${string}`; // undefined = native ETH
  decimals?: number;
}

export interface GasEstimate {
  gasLimit: bigint;
  gasPrice: bigint;
  maxFeePerGas: bigint;
  maxPriorityFeePerGas: bigint;
  estimatedFee: string; // in ETH
  estimatedFeeWei: bigint;
}

/**
 * Estimate gas for ETH or ERC20 transfer
 */
export async function estimateGas(params: EstimateGasParams): Promise<GasEstimate> {
  const { to, amount, tokenAddress, decimals } = params;

  const activeWallet = getActiveWallet();
  if (!activeWallet) {
    throw new Error('No active wallet found');
  }

  if (!isAddress(to)) {
    throw new Error('Invalid recipient address');
  }

  const publicClient = getPublicClient();
  const normalizedTo = getAddress(to);

  // Get current gas prices
  const feeData = await publicClient.estimateFeesPerGas();
  const maxFeePerGas = feeData.maxFeePerGas ?? BigInt(0);
  const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas ?? BigInt(0);

  let gasLimit: bigint;

  if (!tokenAddress) {
    // Native ETH transfer estimation
    const value = parseEther(amount || '0');

    gasLimit = await publicClient.estimateGas({
      account: activeWallet.address,
      to: normalizedTo,
      value,
    });
  } else {
    // ERC20 transfer estimation
    if (!decimals) {
      throw new Error('Decimals required for ERC20 gas estimation');
    }

    if (!isAddress(tokenAddress)) {
      throw new Error('Invalid token address');
    }

    const normalizedTokenAddress = getAddress(tokenAddress);
    const tokenAmount = parseUnits(amount || '0', decimals);

    const data = encodeFunctionData({
      abi: ERC20_TRANSFER_ABI,
      functionName: 'transfer',
      args: [normalizedTo, tokenAmount],
    });

    gasLimit = await publicClient.estimateGas({
      account: activeWallet.address,
      to: normalizedTokenAddress,
      data,
    });
  }

  // Add 20% buffer to gas limit
  const bufferedGasLimit = (gasLimit * BigInt(120)) / BigInt(100);

  // Calculate estimated fee
  const estimatedFeeWei = bufferedGasLimit * maxFeePerGas;
  const estimatedFee = formatEther(estimatedFeeWei);

  return {
    gasLimit: bufferedGasLimit,
    gasPrice: maxFeePerGas,
    maxFeePerGas,
    maxPriorityFeePerGas,
    estimatedFee,
    estimatedFeeWei,
  };
}

