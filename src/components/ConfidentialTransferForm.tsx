'use client';

import { useConfidentialBalance } from '@/hooks/useConfidentialBalance';
import { useConfidentialTransfer } from '@/hooks/useConfidentialTransfer';
import { useState } from 'react';
import { isAddress } from 'viem';
import { Button } from './Button';
import { ConfidentialBadge } from './ConfidentialBalanceDisplay';
import { Input } from './Input';

interface ConfidentialTransferFormProps {
  tokenAddress: `0x${string}`;
  tokenSymbol: string;
  tokenDecimals: number;
  onSuccess?: (hash: `0x${string}`) => void;
  onClose?: () => void;
}

/**
 * Form component for executing confidential transfers on FHERC20 tokens
 */
export function ConfidentialTransferForm({ tokenAddress, tokenSymbol, tokenDecimals, onSuccess, onClose }: ConfidentialTransferFormProps) {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const { transfer, isPending, isConfirming, isSuccess, error, hash, reset } = useConfidentialTransfer();

  const { balance, isLoading: isLoadingBalance } = useConfidentialBalance(tokenAddress);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate recipient
    if (!recipient.trim()) {
      setFormError('Please enter a recipient address');
      return;
    }

    if (!isAddress(recipient)) {
      setFormError('Invalid recipient address format');
      return;
    }

    // Validate amount
    if (!amount.trim()) {
      setFormError('Please enter an amount');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Please enter a valid positive amount');
      return;
    }

    // Check if amount exceeds balance
    if (balance && amountNum > parseFloat(balance)) {
      setFormError('Insufficient balance');
      return;
    }

    // Execute transfer
    const result = await transfer(tokenAddress, recipient as `0x${string}`, amount);

    if (result?.hash && onSuccess) {
      onSuccess(result.hash);
    }
  };

  const handleReset = () => {
    reset();
    setRecipient('');
    setAmount('');
    setFormError(null);
  };

  const displayError = formError || error;
  const isProcessing = isPending || isConfirming;

  if (isSuccess && hash) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-green-50 p-4 text-center">
          <svg className="mx-auto mb-2 h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <h3 className="text-lg font-semibold text-green-800">Transfer Successful!</h3>
          <p className="mt-1 text-sm text-green-600">Your confidential transfer has been confirmed.</p>
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 hover:underline"
          >
            View on Etherscan →
          </a>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={handleReset} className="flex-1">
            New Transfer
          </Button>
          {onClose && (
            <Button onClick={onClose} className="flex-1">
              Close
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-neutral-900">Send {tokenSymbol}</h3>
        <ConfidentialBadge />
      </div>

      <div className="rounded-lg bg-purple-50 p-3 text-sm text-purple-800">
        <strong>Note:</strong> This is a confidential transfer. The amount will be encrypted before being sent to the blockchain.
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-neutral-700">Available Balance</label>
        <div className="rounded-lg bg-neutral-100 p-3 text-sm">
          {isLoadingBalance ? (
            <span className="text-neutral-500">Loading...</span>
          ) : (
            <span className="font-medium">
              {parseFloat(balance || '0').toLocaleString(undefined, {
                maximumFractionDigits: 6,
              })}{' '}
              {tokenSymbol}
            </span>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="recipient" className="mb-2 block text-sm font-medium text-neutral-700">
          Recipient Address
        </label>
        <Input id="recipient" type="text" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="0x..." disabled={isProcessing} />
      </div>

      <div>
        <label htmlFor="amount" className="mb-2 block text-sm font-medium text-neutral-700">
          Amount
        </label>
        <div className="relative">
          <Input
            id="amount"
            type="number"
            step="any"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            disabled={isProcessing}
            className="pr-16"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-sm text-neutral-500">{tokenSymbol}</span>
          </div>
        </div>
        {balance && (
          <button type="button" onClick={() => setAmount(balance)} className="mt-1 text-xs text-blue-600 hover:underline" disabled={isProcessing}>
            Use max
          </button>
        )}
      </div>

      {displayError && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{displayError}</div>}

      {isProcessing && (
        <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
          {isPending && (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              <span>Encrypting and sending transaction...</span>
            </div>
          )}
          {isConfirming && (
            <div className="flex items-center gap-2">
              <LoadingSpinner />
              <span>Waiting for confirmation...</span>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        {onClose && (
          <Button type="button" variant="secondary" onClick={onClose} disabled={isProcessing} className="flex-1">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isProcessing} className="flex-1">
          {isProcessing ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </form>
  );
}

function LoadingSpinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
