import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Wallet {
  id: string;
  name: string;
  color: string;
  privateKey: `0x${string}`;
  publicKey: `0x${string}`;
  address: `0x${string}`;
  createdAt: number;
  imported: boolean;
}

interface WalletState {
  wallets: Wallet[];
  activeWalletId: string | null;
  setWallets: (wallets: Wallet[]) => void;
  setActiveWalletId: (id: string | null) => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    set => ({
      wallets: [],
      activeWalletId: null,

      setWallets: wallets => set({ wallets }),
      setActiveWalletId: id => set({ activeWalletId: id }),
    }),
    {
      name: 'wallet_data',
    },
  ),
);
