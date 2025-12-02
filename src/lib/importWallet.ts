import { useWalletStore, Wallet } from '@/store/useWalletStore';
import { privateKeyToAccount } from 'viem/accounts';
import { secp256k1 } from '@noble/curves/secp256k1';
import { toHex, hexToBytes } from 'viem';
import { generateUUID } from './utils';

export function importWallet(privateKey: `0x${string}`, name: string, color: string): Wallet {
  const { wallets, setWallets, setActiveWalletId } = useWalletStore.getState();

  const account = privateKeyToAccount(privateKey);
  const privateKeyBytes = hexToBytes(privateKey);
  const publicKeyBytes = secp256k1.getPublicKey(privateKeyBytes, false);
  const publicKey = toHex(publicKeyBytes);

  const newWallet: Wallet = {
    id: generateUUID(),
    name,
    color,
    privateKey,
    publicKey,
    address: account.address,
    createdAt: Date.now(),
    imported: true,
  };

  const next = [...wallets, newWallet];

  setWallets(next);
  setActiveWalletId(newWallet.id);

  return newWallet;
}
