import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { getActiveWallet } from './getActiveWallet';

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

if (!INFURA_API_KEY) {
  throw new Error('NEXT_PUBLIC_INFURA_API_KEY is not set');
}

export function getClient() {
  const active = getActiveWallet();
  if (!active) return null;

  const account = privateKeyToAccount(active.privateKey);

  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`),
  });
}
