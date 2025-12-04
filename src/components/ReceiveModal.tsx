'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Dialog } from '@base-ui-components/react/dialog';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from './Button';

import IconArrowInbox from '@icon/arrow-inbox.svg';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const activeWallet = useWalletStore(state => state.wallets.find(w => w.id === state.activeWalletId));
  const [copied, setCopied] = useState(false);

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleCopy = async () => {
    if (!activeWallet?.address) return;

    try {
      await navigator.clipboard.writeText(activeWallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-800/50 transition-opacity" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-100 p-6 shadow-xl">
          {/* Header */}
          <div className="mb-6 flex flex-col items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
              <IconArrowInbox className="h-6 w-6 text-emerald-600" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-neutral-900">Receive Tokens</Dialog.Title>
            <Dialog.Description className="text-center text-sm text-neutral-500">
              Scan QR code or copy address below
            </Dialog.Description>
          </div>

          {/* QR Code */}
          <div className="mb-6 flex justify-center">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm">
              {activeWallet?.address ? (
                <Image
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${activeWallet.address}&bgcolor=ffffff&color=171717&margin=0`}
                  alt="Wallet QR Code"
                  width={180}
                  height={180}
                  className="rounded-lg"
                  unoptimized
                />
              ) : (
                <div className="flex h-[180px] w-[180px] items-center justify-center text-neutral-400">
                  No wallet connected
                </div>
              )}
            </div>
          </div>

          {/* Address */}
          {activeWallet?.address && (
            <div className="mb-6">
              <div className="flex items-center justify-between rounded-lg bg-neutral-200/70 px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs text-neutral-500">Wallet Address</span>
                  <code className="font-mono text-sm font-medium text-neutral-800">
                    {truncateAddress(activeWallet.address)}
                  </code>
                </div>
                <button
                  onClick={handleCopy}
                  className="rounded-md bg-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-400"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button type="button" onClick={handleCopy} className="w-full" disabled={!activeWallet?.address}>
              {copied ? '✓ Address Copied!' : 'Copy Full Address'}
            </Button>
            <Dialog.Close render={<Button type="button" variant="secondary" className="w-full" />}>Close</Dialog.Close>
          </div>

          {/* Footer */}
          <div className="mt-4 rounded-lg bg-amber-50 px-3 py-2">
            <p className="text-center text-xs text-amber-700">⚠️ Only send Sepolia testnet tokens to this address</p>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
