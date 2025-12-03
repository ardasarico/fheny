'use client';

import { useState } from 'react';
import { useTokenStore } from '@/store/useTokenStore';
import { getTokenBalance } from '@/lib/getTokenBalance';
import { isAddress } from 'viem';
import { Button } from './Button';
import { Input } from './Input';

interface AddTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddTokenModal({ isOpen, onClose }: AddTokenModalProps) {
  const { addToken } = useTokenStore();
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!address.trim()) {
      setError('Please enter a token address');
      return;
    }

    if (!isAddress(address)) {
      setError('Invalid address format');
      return;
    }

    setLoading(true);
    try {
      const tokenInfo = await getTokenBalance(address as `0x${string}`);

      if (!tokenInfo) {
        setError('Token not found or error fetching token info');
        return;
      }

      addToken({
        address: tokenInfo.address,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        addedAt: Date.now(),
      });

      // Reset form
      setAddress('');
      onClose();
    } catch (err) {
      console.error('Error adding token:', err);
      setError(err instanceof Error ? err.message : 'Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-xl font-semibold text-neutral-900">Add Token</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token-address" className="mb-2 block text-sm font-medium text-neutral-700">
              Token Contract Address
            </label>
            <Input
              id="token-address"
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="0x..."
              disabled={loading}
            />
          </div>

          {error && <div className="text-sm text-red-600">{error}</div>}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Adding...' : 'Add Token'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

