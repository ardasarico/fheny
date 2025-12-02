import { createWalletClient, createPublicClient, http, fallback } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { getActiveWallet } from './getActiveWallet';

export function getClient() {
  const active = getActiveWallet();
  if (!active) return null;

  const account = privateKeyToAccount(active.privateKey);

  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  });
}

export function getPublicClient() {
  // Use fallback transport with multiple RPC endpoints for reliability
  return createPublicClient({
    chain: sepolia,
    transport: fallback([
      http('https://rpc.sepolia.org'),
      http('https://ethereum-sepolia-rpc.publicnode.com'),
      http('https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'), // Public Infura endpoint
    ]),
  });
}
