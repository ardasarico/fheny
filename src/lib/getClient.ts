import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { getActiveWallet } from './getActiveWallet';

function getAlchemyRpcUrl() {
  const apiKey = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
  if (!apiKey) {
    console.warn('NEXT_PUBLIC_ALCHEMY_API_KEY is not set');
    return `https://eth-sepolia.g.alchemy.com/v2/demo`;
  }
  return `https://eth-sepolia.g.alchemy.com/v2/${apiKey}`;
}

export function getClient() {
  const active = getActiveWallet();
  if (!active) return null;

  const account = privateKeyToAccount(active.privateKey);

  return createWalletClient({
    account,
    chain: sepolia,
    transport: http(getAlchemyRpcUrl()),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: sepolia,
    transport: http(getAlchemyRpcUrl()),
  });
}
