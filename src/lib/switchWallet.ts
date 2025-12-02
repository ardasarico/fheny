import { useWalletStore } from '@/store/useWalletStore';

export function switchWallet(id: string) {
  const { setActiveWalletId } = useWalletStore.getState();
  setActiveWalletId(id);
}
