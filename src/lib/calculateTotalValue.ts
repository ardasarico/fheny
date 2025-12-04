import tokenData from '@/data/tokenData.json';
import type { TokenDataConfig, TokenWithPrice, TotalValueResult } from '@/types/token';
import { getActiveWallet } from './getActiveWallet';
import { getBalance } from './getBalance';
import { getTokenBalance, TokenInfo } from './getTokenBalance';

const FALLBACK_TOKEN_PRICE_USD = 1;
const DEFAULT_ETH_PRICE = 3000;
const PORTFOLIO_CACHE_TTL = process.env.NODE_ENV === 'development' ? 0 : 10 * 1000; // 10 seconds

// Re-export types for consumers
export type { TokenWithPrice, TotalValueResult };

interface PortfolioCacheEntry {
  walletId: string;
  tokenSignature: string;
  timestamp: number;
  result: TotalValueResult;
}

const portfolioCache = new Map<string, PortfolioCacheEntry>();

const config = tokenData as TokenDataConfig;

function getTokenSignature(tokenAddresses: `0x${string}`[]): string {
  if (tokenAddresses.length === 0) return 'none';

  return tokenAddresses
    .map(address => address.toLowerCase())
    .sort()
    .join(',');
}

function getCacheKey(walletId: string, tokenSignature: string) {
  return `${walletId}:${tokenSignature}`;
}

/**
 * Calculate total portfolio value in USD
 */
export async function calculateTotalValue(): Promise<TotalValueResult> {
  return calculateTotalValueWithTokens([]);
}

/**
 * Calculate total value with token list
 */
export async function calculateTotalValueWithTokens(tokenAddresses: `0x${string}`[], options?: { force?: boolean }): Promise<TotalValueResult> {
  const activeWallet = getActiveWallet();

  if (!activeWallet) {
    return {
      ethBalance: '0',
      ethUsdValue: 0,
      ethPrice: 0,
      tokens: [],
      totalUsdValue: 0,
      lastUpdated: Date.now(),
    };
  }

  const tokenSignature = getTokenSignature(tokenAddresses);
  const cacheKey = getCacheKey(activeWallet.id, tokenSignature);
  const cachedEntry = portfolioCache.get(cacheKey);
  const cacheValid = cachedEntry && Date.now() - cachedEntry.timestamp < PORTFOLIO_CACHE_TTL;

  if (!options?.force && cacheValid) {
    return cachedEntry.result;
  }

  const ethPrice = config.ethPrice ?? DEFAULT_ETH_PRICE;
  const tokens = config.tokens ?? {};

  const ethBalance = (await getBalance()) ?? '0';
  const ethBalanceNum = parseFloat(ethBalance) || 0;
  const ethUsdValue = ethBalanceNum * ethPrice;

  const normalizedAddresses = Array.from(new Set(tokenAddresses.map(address => address.toLowerCase())));

  const tokenBalances = await Promise.all(normalizedAddresses.map(address => getTokenBalance(address as `0x${string}`).catch(() => null)));

  const validTokens = tokenBalances.filter((token): token is TokenInfo => token !== null);

  const tokensWithPrice: TokenWithPrice[] = validTokens.map(token => {
    const tokenConfig = tokens[token.address.toLowerCase()];
    const price = tokenConfig?.price ?? FALLBACK_TOKEN_PRICE_USD;
    const logo = tokenConfig?.logo;
    const balanceNum = parseFloat(token.balance) || 0;
    const usdValue = balanceNum * price;

    return {
      ...token,
      price,
      usdValue,
      logo,
    };
  });

  // Calculate total USD value
  const tokensTotalValue = tokensWithPrice.reduce((sum, token) => sum + token.usdValue, 0);
  const totalUsdValue = ethUsdValue + tokensTotalValue;

  const result: TotalValueResult = {
    ethBalance: ethBalance || '0',
    ethUsdValue,
    ethPrice,
    tokens: tokensWithPrice,
    totalUsdValue,
    lastUpdated: Date.now(),
  };

  portfolioCache.set(cacheKey, {
    walletId: activeWallet.id,
    tokenSignature,
    timestamp: result.lastUpdated,
    result,
  });

  return result;
}
