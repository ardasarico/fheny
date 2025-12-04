'use client';

import { detectTokenType } from '@/lib/fherc20/detectTokenType';
import { getFherc20TokenInfo } from '@/lib/fherc20/getIndicatedBalance';
import type { TokenType } from '@/lib/fherc20/types';
import { getTokenBalance } from '@/lib/getTokenBalance';
import { useTokenStore } from '@/store/useTokenStore';
import { Dialog } from '@base-ui-components/react/dialog';
import { useState } from 'react';
import { isAddress } from 'viem';
import { Button } from './Button';
import { ConfidentialBadge } from './ConfidentialBalanceDisplay';
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
  const [detectedType, setDetectedType] = useState<TokenType | null>(null);
  const [detecting, setDetecting] = useState(false);

  // Auto-detect token type when address changes
  const handleAddressChange = async (value: string) => {
    setAddress(value);
    setDetectedType(null);
    setError(null);

    if (isAddress(value)) {
      setDetecting(true);
      try {
        const tokenType = await detectTokenType(value);
        setDetectedType(tokenType);
      } catch (err) {
        console.error('Error detecting token type:', err);
      } finally {
        setDetecting(false);
      }
    }
  };

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
      // Detect token type
      const tokenType = await detectTokenType(address);

      let tokenInfo;
      if (tokenType === 'FHERC20') {
        // For FHERC20 tokens, use the FHERC20 info fetcher
        const fherc20Info = await getFherc20TokenInfo(address as `0x${string}`);
        tokenInfo = {
          address: address as `0x${string}`,
          name: fherc20Info.name,
          symbol: fherc20Info.symbol,
          decimals: fherc20Info.decimals,
        };
      } else {
        // For standard ERC20 tokens
        const erc20Info = await getTokenBalance(address as `0x${string}`);
        if (!erc20Info) {
          setError('Token not found or error fetching token info');
          return;
        }
        tokenInfo = erc20Info;
      }

      addToken({
        address: tokenInfo.address as `0x${string}`,
        name: tokenInfo.name,
        symbol: tokenInfo.symbol,
        decimals: tokenInfo.decimals,
        addedAt: Date.now(),
        tokenType,
        isConfidential: tokenType === 'FHERC20',
      });

      setAddress('');
      setDetectedType(null);
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
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 p-6 shadow-xl">
          <Dialog.Title className="mb-4 text-xl font-semibold text-neutral-900">Add Token</Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="token-address" className="mb-2 block text-sm font-medium text-neutral-700">
                Token Contract Address
              </label>
              <Input
                id="token-address"
                type="text"
                value={address}
                onChange={e => handleAddressChange(e.target.value)}
                placeholder="0x..."
                disabled={loading}
              />
            </div>

            {/* Token Type Detection */}
            {detecting && (
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Detecting token type...
              </div>
            )}

            {detectedType && !detecting && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-600">Token Type:</span>
                {detectedType === 'FHERC20' ? (
                  <ConfidentialBadge />
                ) : (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">Standard ERC-20</span>
                )}
              </div>
            )}

            {detectedType === 'FHERC20' && (
              <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-800">
                <strong>Confidential Token Detected!</strong>
                <p className="mt-1">This is an FHERC20 token. Balances are encrypted and will be decrypted using your wallet.</p>
              </div>
            )}

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div className="flex gap-3">
              <Dialog.Close render={<Button type="button" variant="secondary" disabled={loading} className="flex-1" />}>Cancel</Dialog.Close>
              <Button type="submit" disabled={loading || detecting} className="flex-1">
                {loading ? 'Adding...' : 'Add Token'}
              </Button>
            </div>
          </form>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
