'use client';

import { getTokenBalance } from '@/lib/getTokenBalance';
import { useTokenStore } from '@/store/useTokenStore';
import { Dialog } from '@base-ui-components/react/dialog';
import { isAddress } from 'viem';
import { useState } from 'react';
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

      setAddress('');
      onClose();
    } catch (err) {
      console.error('Error adding token:', err);
      setError(err instanceof Error ? err.message : 'Failed to add token');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-800/50 transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-xl font-semibold text-neutral-900">
            Add Token
          </Dialog.Title>

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
              <Dialog.Close
                render={<Button type="button" variant="secondary" disabled={loading} className="flex-1" />}
              >
                Cancel
              </Dialog.Close>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Token'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
