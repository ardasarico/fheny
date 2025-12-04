'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { Button } from './Button';
import { Input } from './Input';

import IconArrowOutOfBox from '@icon/arrow-out-of-box.svg';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SendModal({ isOpen, onClose }: SendModalProps) {
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-800/50 transition-opacity" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-neutral-100 p-6 shadow-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
              <IconArrowOutOfBox className="h-5 w-5 text-neutral-700" />
            </div>
            <Dialog.Title className="text-xl font-semibold text-neutral-900">Send</Dialog.Title>
          </div>

          <Dialog.Description className="mb-4 text-sm text-neutral-600">
            Transfer tokens to another address
          </Dialog.Description>

          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Recipient Address</label>
              <Input placeholder="0x..." />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-700">Amount</label>
              <div className="flex gap-2">
                <Input placeholder="0.0" type="number" className="flex-1" />
                <Button type="button" variant="secondary">MAX</Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md bg-neutral-200 px-3 py-2 text-sm">
              <span className="text-neutral-600">Network Fee</span>
              <span className="text-neutral-800">~0.0001 ETH</span>
            </div>

            <div className="flex gap-3 pt-2">
              <Dialog.Close render={<Button type="button" variant="secondary" className="flex-1" />}>
                Cancel
              </Dialog.Close>
              <Button type="button" className="flex-1">
                Send
              </Button>
            </div>
          </form>

          <p className="mt-4 text-center text-xs text-neutral-500">
            Demo only - transactions not supported yet
          </p>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

