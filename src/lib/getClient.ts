import { Chain, createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { getActiveWallet } from './getActiveWallet';

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

if (!INFURA_API_KEY) {
  throw new Error('NEXT_PUBLIC_INFURA_API_KEY is not set');
}

// Fhenix Helium Testnet configuration
export const fhenixHelium: Chain = {
  id: 8008135,
  name: 'Fhenix Helium',
  nativeCurrency: {
    decimals: 18,
    name: 'Fhenix Ether',
    symbol: 'tFHE',
  },
  rpcUrls: {
    default: {
      http: ['https://api.helium.fhenix.zone'],
    },
    public: {
      http: ['https://api.helium.fhenix.zone'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Fhenix Explorer',
      url: 'https://explorer.helium.fhenix.zone',
    },
  },
  testnet: true,
};

// Default to Sepolia, can be switched to Fhenix for FHERC20 tokens
const defaultChain = sepolia;
const defaultRpcUrl = `https://sepolia.infura.io/v3/${INFURA_API_KEY}`;

export function getClient(chain: Chain = defaultChain) {
  const active = getActiveWallet();
  if (!active) return null;

  const account = privateKeyToAccount(active.privateKey);
  const rpcUrl = chain.id === fhenixHelium.id ? fhenixHelium.rpcUrls.default.http[0] : defaultRpcUrl;

  return createWalletClient({
    account,
    chain,
    transport: http(rpcUrl),
  });
}

export function getPublicClient(chain: Chain = defaultChain) {
  const rpcUrl = chain.id === fhenixHelium.id ? fhenixHelium.rpcUrls.default.http[0] : defaultRpcUrl;

  return createPublicClient({
    chain,
    transport: http(rpcUrl),
  });
}

// Fhenix-specific client helpers
export function getFhenixWalletClient() {
  return getClient(fhenixHelium);
}

export function getFhenixPublicClient() {
  return getPublicClient(fhenixHelium);
}
