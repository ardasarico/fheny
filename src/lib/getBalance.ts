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
    console.log('Original address:', active.address);
    console.log('Normalized address:', normalizedAddress);

    const publicClient = getPublicClient();
    console.log('Fetching balance for address:', normalizedAddress);

    const balance = await publicClient.getBalance({
      address: normalizedAddress,
      blockTag: 'latest', // Use latest for most up-to-date balance
    });

    console.log('Raw balance (wei):', balance.toString());
    const formatted = formatEther(balance);
    console.log('Formatted balance (ETH):', formatted);

    return formatted;
  } catch (error) {
    console.error('Error fetching balance:', error);
    throw error;
  }
}
