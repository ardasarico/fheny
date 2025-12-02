import { useWalletStore } from '@/store/useWalletStore';

export function removeWallet(id: string) {
  const { wallets, setWallets, setActiveWalletId } = useWalletStore.getState();

  const next = wallets.filter((w) => w.id !== id);
  const nextActive = next.length ? next[0].id : null;

  setWallets(next);
  setActiveWalletId(nextActive);
}
