import type { TokenType } from '@/lib/fherc20/types';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Token {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  addedAt: number;
  /** Token type: 'ERC20' or 'FHERC20' */
  tokenType?: TokenType;
}

interface TokenState {
  tokens: Token[];
  addToken: (token: Token) => void;
  updateToken: (address: `0x${string}`, updates: Partial<Token>) => void;
  removeToken: (address: `0x${string}`) => void;
  clearTokens: () => void;
  /** Get only FHERC20 tokens */
  getConfidentialTokens: () => Token[];
  /** Get only standard ERC20 tokens */
  getStandardTokens: () => Token[];
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      tokens: [],

      addToken: token =>
        set(state => {
          // Check if token already exists
          if (state.tokens.some(t => t.address.toLowerCase() === token.address.toLowerCase())) {
            return state;
          }
          return { tokens: [...state.tokens, token] };
        }),

      updateToken: (address, updates) =>
        set(state => ({
          tokens: state.tokens.map(t => (t.address.toLowerCase() === address.toLowerCase() ? { ...t, ...updates } : t)),
        })),

      removeToken: address =>
        set(state => ({
          tokens: state.tokens.filter(t => t.address.toLowerCase() !== address.toLowerCase()),
        })),

      clearTokens: () => set({ tokens: [] }),

      getConfidentialTokens: () => {
        const { tokens } = get();
        return tokens.filter(t => t.tokenType === 'FHERC20');
      },

      getStandardTokens: () => {
        const { tokens } = get();
        return tokens.filter(t => t.tokenType === 'ERC20' || !t.tokenType);
      },
    }),
    {
      name: 'token_data',
    },
  ),
);
