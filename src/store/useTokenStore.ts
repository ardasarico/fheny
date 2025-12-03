import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Token {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  addedAt: number;
}

interface TokenState {
  tokens: Token[];
  addToken: (token: Token) => void;
  removeToken: (address: `0x${string}`) => void;
  clearTokens: () => void;
}

export const useTokenStore = create<TokenState>()(
  persist(
    set => ({
      tokens: [],

      addToken: token =>
        set(state => {
          // Check if token already exists
          if (state.tokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
            return state;
          }
          return { tokens: [...state.tokens, token] };
        }),

      removeToken: address =>
        set(state => ({
          tokens: state.tokens.filter(t => t.address.toLowerCase() !== address.toLowerCase()),
        })),

      clearTokens: () => set({ tokens: [] }),
    }),
    {
      name: 'token_data',
    },
  ),
);

