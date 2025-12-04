import { formatEther, getAddress, isAddress } from 'viem';
import { getActiveWallet } from './getActiveWallet';
import { getPublicClient } from './getClient';

export async function getBalance(): Promise<string | null> {
  const active = getActiveWallet();
  if (!active) return null;

  try {
    // Validate and normalize address format
    if (!isAddress(active.address)) {
      console.error('Invalid address format:', active.address);
      throw new Error('Invalid address format');
    }

    // Normalize address to checksum format
    const normalizedAddress = getAddress(active.address);
    const publicClient = getPublicClient();

    const balance = await publicClient.getBalance({
      address: normalizedAddress,
      blockTag: 'latest',
    });

    return formatEther(balance);
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}
