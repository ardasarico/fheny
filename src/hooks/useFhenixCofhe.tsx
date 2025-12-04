'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { CoFheInUint64, cofhejs, EncryptableUint64, Permit } from 'cofhejs/web';
import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';

interface CofheState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  cofhe: typeof cofhejs | null;
  currentWalletAddress: string | null;
}

interface CofheContextValue extends CofheState {
  initialize: () => Promise<void>;
  createPermit: (issuer: string) => Promise<Permit | null>;
  getPermit: (issuer: string) => Promise<Permit | null>;
  unseal: (encryptedValue: bigint, fheType: (typeof FheTypes)[keyof typeof FheTypes], issuer: string, permitHash: string) => Promise<bigint | null>;
  encrypt: (values: EncryptableUint64[]) => Promise<CoFheInUint64[] | null>;
}

const CofheContext = createContext<CofheContextValue | null>(null);

// Permit cache to avoid recreating permits
const permitCache = new Map<string, Permit>();

// FheTypes enum matching cofhejs
export const FheTypes = {
  Bool: 0,
  Uint8: 1,
  Uint16: 2,
  Uint32: 3,
  Uint64: 4,
  Uint128: 5,
  Uint256: 6,
  Address: 7,
} as const;

const INFURA_API_KEY = process.env.NEXT_PUBLIC_INFURA_API_KEY;

interface CofheProviderProps {
  children: ReactNode;
}

export function CofheProvider({ children }: CofheProviderProps) {
  const [state, setState] = useState<CofheState>({
    isInitialized: false,
    isInitializing: false,
    error: null,
    cofhe: null,
    currentWalletAddress: null,
  });

  const { wallets, activeWalletId } = useWalletStore();
  const activeWallet = wallets.find(w => w.id === activeWalletId) || null;
  const initializationRef = useRef<Promise<void> | null>(null);

  const initialize = useCallback(async () => {
    if (!activeWallet) {
      setState(prev => ({
        ...prev,
        isInitialized: false,
        error: 'No active wallet',
        cofhe: null,
        currentWalletAddress: null,
      }));
      return;
    }

    // If already initialized for this wallet, skip
    if (state.isInitialized && state.currentWalletAddress === activeWallet.address) {
      return;
    }

    // If already initializing, wait for the existing initialization
    if (initializationRef.current) {
      await initializationRef.current;
      return;
    }

    setState(prev => ({
      ...prev,
      isInitializing: true,
      error: null,
    }));

    const initPromise = (async () => {
      try {
        // Dynamic import of cofhejs to avoid SSR issues
        const { cofhejs } = await import('cofhejs/web');
        const { Wallet, JsonRpcProvider } = await import('ethers');

        // Create ethers provider and signer from the active wallet
        const provider = new JsonRpcProvider(`https://sepolia.infura.io/v3/${INFURA_API_KEY}`);
        const wallet = new Wallet(activeWallet.privateKey, provider);

        // Initialize cofhejs with ethers
        await cofhejs.initializeWithEthers({
          ethersProvider: provider,
          ethersSigner: wallet,
          environment: 'TESTNET',
        });

        setState({
          isInitialized: true,
          isInitializing: false,
          error: null,
          cofhe: cofhejs,
          currentWalletAddress: activeWallet.address,
        });

        console.log('cofhejs initialized successfully for wallet:', activeWallet.address);
      } catch (error) {
        console.error('Failed to initialize cofhejs:', error);
        setState(prev => ({
          ...prev,
          isInitialized: false,
          isInitializing: false,
          error: error instanceof Error ? error.message : 'Failed to initialize cofhejs',
          cofhe: null,
        }));
      }
    })();

    initializationRef.current = initPromise;
    await initPromise;
    initializationRef.current = null;
  }, [activeWallet, state.isInitialized, state.currentWalletAddress]);

  // Re-initialize when wallet changes
  useEffect(() => {
    if (activeWallet && activeWallet.address !== state.currentWalletAddress) {
      // Clear permit cache when wallet changes
      permitCache.clear();
      initialize();
    }
  }, [activeWallet, state.currentWalletAddress, initialize]);

  const createPermit = useCallback(
    async (issuer: string): Promise<Permit | null> => {
      if (!state.cofhe || !state.isInitialized) {
        console.error('cofhejs not initialized');
        return null;
      }

      // Check cache first
      const cacheKey = `${issuer.toLowerCase()}`;
      const cached = permitCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      try {
        const permit = await state.cofhe.createPermit({
          type: 'self',
          issuer,
        });

        if (!permit.data) {
          return null;
        }

        // Cache the permit
        permitCache.set(cacheKey, permit.data);

        return permit.data;
      } catch (error) {
        console.error('Failed to create permit:', error);
        return null;
      }
    },
    [state.cofhe, state.isInitialized],
  );

  const getPermit = useCallback(
    async (issuer: string): Promise<Permit | null> => {
      // Check cache first
      const cacheKey = `${issuer.toLowerCase()}`;
      const cached = permitCache.get(cacheKey);
      if (cached) {
        return cached;
      }

      // If not cached, create a new one
      return createPermit(issuer);
    },
    [createPermit],
  );

  const unseal = useCallback(
    async (encryptedValue: bigint, fheType: (typeof FheTypes)[keyof typeof FheTypes], issuer: string, permitHash: string): Promise<bigint | null> => {
      if (!state.cofhe || !state.isInitialized) {
        console.error('cofhejs not initialized');
        return null;
      }

      try {
        const { FheTypes: CofheFheTypes } = await import('cofhejs/web');

        // Map our FheTypes to cofhejs FheTypes
        const fheTypeMap: Record<(typeof FheTypes)[keyof typeof FheTypes], (typeof CofheFheTypes)[keyof typeof CofheFheTypes]> = {
          [FheTypes.Bool]: CofheFheTypes.Bool,
          [FheTypes.Uint8]: CofheFheTypes.Uint8,
          [FheTypes.Uint16]: CofheFheTypes.Uint16,
          [FheTypes.Uint32]: CofheFheTypes.Uint32,
          [FheTypes.Uint64]: CofheFheTypes.Uint64,
          [FheTypes.Uint128]: CofheFheTypes.Uint128,
          [FheTypes.Uint256]: CofheFheTypes.Uint256,
          [FheTypes.Address]: CofheFheTypes.Uint256,
        };

        const mappedType = fheTypeMap[fheType] || CofheFheTypes.Uint64;

        const unsealed = await state.cofhe.unseal(encryptedValue, mappedType, issuer, permitHash);

        if (unsealed.error || !unsealed.data) {
          console.error('Unsealing error:', unsealed.error);
          return null;
        }

        return BigInt(unsealed.data);
      } catch (error) {
        console.error('Failed to unseal value:', error);
        return null;
      }
    },
    [state.cofhe, state.isInitialized],
  );

  const encrypt = useCallback(
    async (values: EncryptableUint64[]): Promise<CoFheInUint64[] | null> => {
      if (!state.cofhe || !state.isInitialized) {
        console.error('cofhejs not initialized');
        return null;
      }

      try {
        const encrypted = await state.cofhe.encrypt(values);
        return encrypted.data;
      } catch (error) {
        console.error('Failed to encrypt values:', error);
        return null;
      }
    },
    [state.cofhe, state.isInitialized],
  );

  const contextValue: CofheContextValue = {
    ...state,
    initialize,
    createPermit,
    getPermit,
    unseal,
    encrypt,
  };

  return <CofheContext.Provider value={contextValue}>{children}</CofheContext.Provider>;
}

/**
 * Hook to access cofhejs functionality
 * Must be used within a CofheProvider
 */
export function useFhenixCofhe(): CofheContextValue {
  const context = useContext(CofheContext);

  if (!context) {
    throw new Error('useFhenixCofhe must be used within a CofheProvider');
  }

  return context;
}

// Export FheTypes for use in components
export { FheTypes as FheTypesEnum };
