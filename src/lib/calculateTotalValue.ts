import mockPortfolio from '@/data/mockPortfolio.json';
import { getActiveWallet } from './getActiveWallet';
import { getBalance } from './getBalance';
import { getTokenBalance, TokenInfo } from './getTokenBalance';

const FALLBACK_TOKEN_PRICE_USD = 1;
const DEFAULT_ETH_PRICE = 3000;
const PORTFOLIO_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export interface TokenWithPrice extends TokenInfo {
  usdValue: number;
  price: number;
}

export interface TotalValueResult {
  ethBalance: string;
  ethUsdValue: number;
  ethPrice: number;
  tokens: TokenWithPrice[];
  totalUsdValue: number;
  lastUpdated: number;
}

interface PortfolioCacheEntry {
  walletId: string;
  tokenSignature: string;
  timestamp: number;
  result: TotalValueResult;
}

const portfolioCache = new Map<string, PortfolioCacheEntry>();
type MockPortfolioRecord = {
  ethBalance?: string;
  ethPrice?: number;
  tokens?: MockPortfolioToken[];
};

interface MockPortfolioToken {
  address: `0x${string}`;
  symbol: string;
  name: string;
  decimals?: number;
  balance?: string;
  priceUsd?: number;
}

const portfolioData = mockPortfolio as Record<string, MockPortfolioRecord>;

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

function getPortfolioForWallet(address?: string): MockPortfolioRecord {
  if (!address) {
    return portfolioData.default ?? { tokens: [] };
  }

  const key = address.toLowerCase();
  return portfolioData[key] ?? portfolioData.default ?? { tokens: [] };
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
export async function calculateTotalValueWithTokens(
  tokenAddresses: `0x${string}`[],
  options?: { force?: boolean },
): Promise<TotalValueResult> {
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

  const portfolio = getPortfolioForWallet(activeWallet.address);
  const ethPrice = portfolio.ethPrice ?? DEFAULT_ETH_PRICE;

  const ethBalance = (await getBalance()) ?? '0';
  const ethBalanceNum = parseFloat(ethBalance) || 0;
  const ethUsdValue = ethBalanceNum * ethPrice;

  const priceMap = new Map<string, MockPortfolioToken>();
  (portfolio.tokens ?? []).forEach(token => {
    priceMap.set(token.address.toLowerCase(), token);
  });

  const normalizedAddresses = Array.from(new Set(tokenAddresses.map(address => address.toLowerCase())));

  const tokenBalances = await Promise.all(
    normalizedAddresses.map(address =>
      getTokenBalance(address as `0x${string}`).catch(() => null),
    ),
  );

  const validTokens = tokenBalances.filter((token): token is TokenInfo => token !== null);

  const tokensWithPrice: TokenWithPrice[] = validTokens.map(token => {
    const metadata = priceMap.get(token.address.toLowerCase());
    const price = metadata?.priceUsd ?? FALLBACK_TOKEN_PRICE_USD;
    const balanceNum = parseFloat(token.balance) || 0;
    const usdValue = balanceNum * price;

    return {
      ...token,
      price,
      usdValue,
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

