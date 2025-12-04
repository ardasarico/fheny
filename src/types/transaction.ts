export type TransactionCategory = 'external' | 'erc20' | 'erc721' | 'erc1155' | 'internal';
export type TransactionDirection = 'in' | 'out';

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  category: TransactionCategory;
  direction: TransactionDirection;
  timestamp: string;
  blockNum: string;
  contractAddress?: string;
  // Token metadata
  tokenId?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  decimals?: number;
}

// Alchemy API response types
export interface AlchemyAssetTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: TransactionCategory;
  rawContract: {
    value: string | null;
    address: string | null;
    decimal: string | null;
  };
  metadata: {
    blockTimestamp: string;
  };
  tokenId?: string;
}

export interface AlchemyTransferResponse {
  jsonrpc: string;
  id: number;
  result: {
    transfers: AlchemyAssetTransfer[];
    pageKey?: string;
  };
}

// Token Metadata types
export interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

export interface AlchemyTokenMetadataResponse {
  jsonrpc: string;
  id: number;
  result: TokenMetadata;
}
