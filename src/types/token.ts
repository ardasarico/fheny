// Token data configuration from tokenData.json
export interface TokenDataEntry {
  price: number;
  logo?: string;
}

export interface TokenDataConfig {
  ethPrice: number;
  tokens: Record<string, TokenDataEntry>;
}

// Token info from blockchain
export interface TokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: bigint;
}

// Token with price calculation
export interface TokenWithPrice extends TokenInfo {
  usdValue: number;
  price: number;
  logo?: string;
}

// Portfolio calculation result
export interface TotalValueResult {
  ethBalance: string;
  ethUsdValue: number;
  ethPrice: number;
  tokens: TokenWithPrice[];
  totalUsdValue: number;
  lastUpdated: number;
}

