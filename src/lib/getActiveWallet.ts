import { useWalletStore, Wallet } from '@/store/useWalletStore';

export function getActiveWallet(): Wallet | null {
  const { wallets, activeWalletId } = useWalletStore.getState();
  return wallets.find((w) => w.id === activeWalletId) || null;
}
