'use client';

import { useWalletStore } from '@/store/useWalletStore';
import { Dialog } from '@base-ui-components/react/dialog';
import { useState } from 'react';
import { Button } from './Button';

import IconArrowInbox from '@icon/arrow-inbox.svg';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiveModal({ isOpen, onClose }: ReceiveModalProps) {
  const activeWallet = useWalletStore(state =>
    state.wallets.find(w => w.id === state.activeWalletId)
  );
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

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-800/50 transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
              <IconArrowInbox className="h-5 w-5 text-neutral-700" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-neutral-900">Receive</Dialog.Title>
          </div>

          <Dialog.Description className="mb-4 text-sm text-neutral-600">
            Share your address to receive tokens
          </Dialog.Description>

          <div className="flex flex-col items-center gap-4">
            {/* QR Code Placeholder */}
            <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-neutral-300 bg-neutral-200">
              <span className="text-5xl">📱</span>
            </div>

            <div className="w-full">
              <p className="mb-2 text-center text-sm font-medium text-neutral-600">Your Wallet Address</p>
              <div className="rounded-md bg-neutral-200 p-3">
                <code className="block break-all text-center text-sm text-neutral-800">
                  {activeWallet?.address || 'No wallet connected'}
                </code>
              </div>
            </div>

            <div className="flex w-full gap-3">
              <Dialog.Close render={<Button type="button" variant="secondary" className="flex-1" />}>
                Close
              </Dialog.Close>
              <Button type="button" onClick={handleCopy} className="flex-1">
                {copied ? '✓ Copied!' : 'Copy Address'}
              </Button>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-neutral-500">
            Only send Sepolia testnet tokens to this address
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

