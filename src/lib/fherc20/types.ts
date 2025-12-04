/**
 * Types for FHERC20 confidential tokens
 */

export type TokenType = 'ERC20' | 'FHERC20';

export interface ConfidentialTokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  tokenType: TokenType;
  // For FHERC20: indicated balance (public hint, 0.0000-0.9999)
  indicatedBalance: string;
  // For FHERC20: the actual decrypted balance (null if not yet decrypted)
  decryptedBalance: string | null;
  // For ERC20: the raw balance
  balance: string;
  balanceRaw: bigint;
  // Whether balance is currently being decrypted
  isDecrypting: boolean;
  // Error if decryption failed
  decryptionError: string | null;
}

export interface EncryptedBalanceResult {
  encryptedHandle: bigint;
  isLoading: boolean;
  error: string | null;
}

export interface DecryptedBalanceResult {
  balance: string | null;
  balanceRaw: bigint | null;
  isLoading: boolean;
  error: string | null;
}

export interface ConfidentialTransferParams {
  tokenAddress: `0x${string}`;
  to: `0x${string}`;
  amount: bigint;
}

export interface ConfidentialTransferResult {
  hash: `0x${string}`;
  success: boolean;
}

export interface CofheState {
  isInitialized: boolean;
  isInitializing: boolean;
  error: string | null;
  permitCache: Map<string, PermitData>;
}

export interface PermitData {
  issuer: string;
  hash: string;
  createdAt: number;
}

// Encryption step callback type
export type EncryptionStepCallback = (step: string) => void;
