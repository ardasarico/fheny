import { NextRequest, NextResponse } from 'next/server';

// Use server-side env (no NEXT_PUBLIC_ prefix needed)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;
const ALCHEMY_BASE_URL = `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`;

// Types
interface AlchemyAssetTransfer {
  blockNum: string;
  hash: string;
  from: string;
  to: string;
  value: number | null;
  asset: string | null;
  category: 'external' | 'erc20' | 'erc721' | 'erc1155' | 'internal';
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

interface TokenMetadata {
  name: string | null;
  symbol: string | null;
  decimals: number | null;
  logo: string | null;
}

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  asset: string;
  category: string;
  direction: 'in' | 'out';
  timestamp: string;
  blockNum: string;
  contractAddress?: string;
  tokenName?: string;
  tokenSymbol?: string;
  tokenLogo?: string;
  decimals?: number;
}

// Server-side cache for token metadata
const tokenMetadataCache = new Map<string, TokenMetadata>();

// Native ETH metadata
const ETH_METADATA: TokenMetadata = {
  name: 'Ethereum',
  symbol: 'ETH',
  decimals: 18,
  logo: 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
};

// Fetch token metadata
async function fetchTokenMetadata(contractAddress: string): Promise<TokenMetadata | null> {
  if (tokenMetadataCache.has(contractAddress)) {
    return tokenMetadataCache.get(contractAddress)!;
  }

  try {
    const response = await fetch(ALCHEMY_BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenMetadata',
        params: [contractAddress],
      }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    const metadata = data.result as TokenMetadata;
    tokenMetadataCache.set(contractAddress, metadata);
    return metadata;
  } catch {
    return null;
  }
}

// Fetch transfers from Alchemy
async function fetchTransfers(
  address: string,
  direction: 'from' | 'to',
  maxCount: number,
): Promise<AlchemyAssetTransfer[]> {
  const params: Record<string, unknown> = {
    fromBlock: '0x0',
    toBlock: 'latest',
    category: ['external', 'erc20'],
    withMetadata: true,
    maxCount: `0x${maxCount.toString(16)}`,
    order: 'desc',
  };

  if (direction === 'from') {
    params.fromAddress = address;
  } else {
    params.toAddress = address;
  }

  const response = await fetch(ALCHEMY_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'alchemy_getAssetTransfers',
      params: [params],
    }),
  });

  if (!response.ok) {
    throw new Error(`Alchemy API error: ${response.status}`);
  }

  const data = await response.json();
  return data.result?.transfers || [];
}

// Format transfer
function formatTransfer(
  transfer: AlchemyAssetTransfer,
  direction: 'in' | 'out',
  tokenMetadata?: TokenMetadata | null,
): Transaction {
  const isNativeTransfer = transfer.category === 'external';
  const metadata = isNativeTransfer ? ETH_METADATA : tokenMetadata;

  return {
    hash: transfer.hash,
    from: transfer.from,
    to: transfer.to,
    value: transfer.value?.toString() ?? '0',
    asset: transfer.asset ?? metadata?.symbol ?? 'Unknown',
    category: transfer.category,
    direction,
    timestamp: transfer.metadata.blockTimestamp,
    blockNum: transfer.blockNum,
    contractAddress: transfer.rawContract.address ?? undefined,
    tokenName: metadata?.name ?? undefined,
    tokenSymbol: metadata?.symbol ?? undefined,
    tokenLogo: metadata?.logo ?? undefined,
    decimals:
      metadata?.decimals ??
      (transfer.rawContract.decimal ? parseInt(transfer.rawContract.decimal, 16) : 18),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');
  const maxCount = parseInt(searchParams.get('maxCount') || '50', 10);

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  if (!ALCHEMY_API_KEY) {
    return NextResponse.json({ error: 'Alchemy API key not configured' }, { status: 500 });
  }

  try {
    // Fetch both directions in parallel
    const [incomingTransfers, outgoingTransfers] = await Promise.all([
      fetchTransfers(address, 'to', maxCount),
      fetchTransfers(address, 'from', maxCount),
    ]);

    const allTransfers = [...incomingTransfers, ...outgoingTransfers];

    // Get unique contract addresses for ERC20 tokens
    const contractAddresses = [
      ...new Set(
        allTransfers
          .filter(t => t.category === 'erc20' && t.rawContract.address)
          .map(t => t.rawContract.address!),
      ),
    ];

    // Fetch all token metadata in parallel
    const metadataResults = await Promise.all(
      contractAddresses.map(async addr => ({
        address: addr,
        metadata: await fetchTokenMetadata(addr),
      })),
    );

    const metadataMap = new Map(
      metadataResults.map(r => [r.address, r.metadata]),
    );

    // Format transfers
    const incoming = incomingTransfers.map(t =>
      formatTransfer(t, 'in', t.rawContract.address ? metadataMap.get(t.rawContract.address) : null),
    );
    const outgoing = outgoingTransfers.map(t =>
      formatTransfer(t, 'out', t.rawContract.address ? metadataMap.get(t.rawContract.address) : null),
    );

    // Combine, sort, and dedupe
    const allTransactions = [...incoming, ...outgoing]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .filter((tx, index, self) => index === self.findIndex(t => t.hash === tx.hash));

    return NextResponse.json({
      transactions: allTransactions,
      count: allTransactions.length,
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}

