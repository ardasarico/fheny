'use client';

import { Dialog } from '@base-ui-components/react/dialog';
import { Menu } from '@base-ui-components/react/menu';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { isAddress } from 'viem';

import { usePortfolio } from '@/hooks/usePortfolio';
import { estimateGas, GasEstimate } from '@/lib/estimateGas';
import { sendToken, waitForTransaction } from '@/lib/sendToken';

import { Button } from './Button';
import { Input } from './Input';
import TokenLogo from './TokenLogo';

import IconArrowOutOfBox from '@icon/arrow-out-of-box.svg';
import IconChevronDown from '@icon/chevron-down.svg';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTokenAddress?: `0x${string}`; // Pre-select token by address (undefined = ETH)
}

type ModalStep = 'input' | 'confirm' | 'pending' | 'success' | 'error';

interface TokenOption {
  address?: `0x${string}`;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
}

export default function SendModal({ isOpen, onClose, defaultTokenAddress }: SendModalProps) {
  const { data: portfolio, refetch } = usePortfolio();

  // Form state
  const [selectedToken, setSelectedToken] = useState<TokenOption | null>(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  // UI state
  const [step, setStep] = useState<ModalStep>('input');
  const [gasEstimate, setGasEstimate] = useState<GasEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Build token options from portfolio (only tokens with balance > 0)
  const tokenOptions = useMemo<TokenOption[]>(() => {
    if (!portfolio) return [];

    const options: TokenOption[] = [];

    // Add ETH if balance > 0
    if (portfolio.ethBalance && parseFloat(portfolio.ethBalance) > 0) {
      options.push({
        symbol: 'ETH',
        name: 'Ethereum',
        balance: portfolio.ethBalance,
        decimals: 18,
      });
    }

    // Add ERC20 tokens with balance > 0
    portfolio.tokens.forEach(token => {
      if (parseFloat(token.balance) > 0) {
        options.push({
          address: token.address,
          symbol: token.symbol,
          name: token.name,
          balance: token.balance,
          decimals: token.decimals,
        });
      }
    });

    return options;
  }, [portfolio]);

  // Set default token when options change (only if no token selected)
  useEffect(() => {
    if (tokenOptions.length > 0 && !selectedToken) {
      // If defaultTokenAddress is provided, find and select that token
      if (defaultTokenAddress !== undefined) {
        const defaultToken = tokenOptions.find(t => t.address?.toLowerCase() === defaultTokenAddress?.toLowerCase());
        if (defaultToken) {
          setSelectedToken(defaultToken);
          return;
        }
      }
      // If defaultTokenAddress is undefined (ETH) or not found, select first option
      if (defaultTokenAddress === undefined) {
        const ethToken = tokenOptions.find(t => !t.address);
        if (ethToken) {
          setSelectedToken(ethToken);
          return;
        }
      }
      // Fallback to first token
      setSelectedToken(tokenOptions[0]);
    }
  }, [tokenOptions, selectedToken, defaultTokenAddress]);

  // Reset state only when modal opens (not when tokenOptions change)
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setRecipient('');
      setAmount('');
      setGasEstimate(null);
      setTxHash(null);
      setError(null);
      setSelectedToken(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Estimate gas when form is valid
  useEffect(() => {
    const estimate = async () => {
      if (!selectedToken || !recipient || !amount || !isAddress(recipient)) {
        setGasEstimate(null);
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setGasEstimate(null);
        return;
      }

      setIsEstimating(true);
      try {
        const estimate = await estimateGas({
          to: recipient as `0x${string}`,
          amount,
          tokenAddress: selectedToken.address,
          decimals: selectedToken.decimals,
        });
        setGasEstimate(estimate);
      } catch (err) {
        console.error('Gas estimation failed:', err);
        setGasEstimate(null);
      } finally {
        setIsEstimating(false);
      }
    };

    const debounce = setTimeout(estimate, 500);
    return () => clearTimeout(debounce);
  }, [selectedToken, recipient, amount]);

  // Validation
  const isValidAddress = recipient ? isAddress(recipient) : true;
  const amountNum = parseFloat(amount) || 0;
  const balanceNum = selectedToken ? parseFloat(selectedToken.balance) : 0;
  const hasInsufficientBalance = amountNum > balanceNum;

  const canProceed = selectedToken && recipient && isAddress(recipient) && amount && amountNum > 0 && !hasInsufficientBalance && gasEstimate;

  // Handlers
  const handleMaxClick = useCallback(() => {
    if (!selectedToken) return;

    let maxAmount = parseFloat(selectedToken.balance);

    // For ETH, subtract estimated gas fee
    if (!selectedToken.address && gasEstimate) {
      const gasFee = parseFloat(gasEstimate.estimatedFee);
      maxAmount = Math.max(0, maxAmount - gasFee * 1.1); // 10% buffer
    }

    setAmount(maxAmount.toString());
  }, [selectedToken, gasEstimate]);

  const handleSendClick = useCallback(() => {
    if (canProceed) {
      setStep('confirm');
    }
  }, [canProceed]);

  const handleConfirm = useCallback(async () => {
    if (!selectedToken || !recipient || !amount) return;

    setStep('pending');
    setError(null);

    try {
      const result = await sendToken({
        to: recipient as `0x${string}`,
        amount,
        tokenAddress: selectedToken.address,
        decimals: selectedToken.decimals,
      });

      setTxHash(result.hash);

      // Wait for confirmation
      await waitForTransaction(result.hash);

      setStep('success');
      // Refetch portfolio to update balances
      refetch();
    } catch (err) {
      console.error('Transaction failed:', err);
      setError(err instanceof Error ? err.message : 'Transaction failed');
      setStep('error');
    }
  }, [selectedToken, recipient, amount, refetch]);

  const handleClose = useCallback(() => {
    if (step !== 'pending') {
      onClose();
    }
  }, [step, onClose]);

  // Only allow closing via buttons, not backdrop click or ESC during transaction flow
  const handleOpenChange = (open: boolean) => {
    if (!open && step === 'input') {
      onClose();
    }
  };

  // Render functions for each step
  const renderInputStep = () => (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-200">
          <IconArrowOutOfBox className="h-5 w-5 text-neutral-700" />
        </div>
        <Dialog.Title className="text-xl font-semibold text-neutral-900">Send</Dialog.Title>
      </div>

      <Dialog.Description className="mb-4 text-sm text-neutral-600">Transfer tokens to another address</Dialog.Description>

      <div className="space-y-4">
        {/* Token Selector */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Token</label>
          <Menu.Root>
            <Menu.Trigger className="flex w-full items-center justify-between rounded-xs border border-neutral-300 bg-neutral-200 px-4 py-2.5 text-left transition hover:bg-neutral-300 focus:border-neutral-600 focus:outline-none">
              {selectedToken ? (
                <div className="flex items-center gap-2">
                  <TokenLogo symbol={selectedToken.symbol} address={selectedToken.address} size="sm" />
                  <span className="font-medium">{selectedToken.symbol}</span>
                  <span className="text-sm text-neutral-500">{parseFloat(selectedToken.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                </div>
              ) : (
                <span className="text-neutral-500">Select token</span>
              )}
              <IconChevronDown className="h-5 w-5 text-neutral-500" />
            </Menu.Trigger>
            <Menu.Portal>
              <Menu.Positioner sideOffset={4} className="z-[200]">
                <Menu.Popup className="max-h-60 w-[var(--anchor-width)] overflow-auto rounded-md border border-neutral-300 bg-neutral-100 py-1 shadow-lg">
                  {tokenOptions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-neutral-500">No tokens available</div>
                  ) : (
                    tokenOptions.map(token => (
                      <Menu.Item
                        key={token.address || 'ETH'}
                        onClick={() => setSelectedToken(token)}
                        className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-neutral-100"
                      >
                        <TokenLogo symbol={token.symbol} address={token.address} size="sm" />
                        <span className="font-medium">{token.symbol}</span>
                        <span className="text-neutral-500">{parseFloat(token.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</span>
                      </Menu.Item>
                    ))
                  )}
                </Menu.Popup>
              </Menu.Positioner>
            </Menu.Portal>
          </Menu.Root>
        </div>

        {/* Recipient Address */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Recipient Address</label>
          <Input
            placeholder="0x..."
            value={recipient}
            onChange={e => setRecipient(e.target.value)}
            className={!isValidAddress ? 'border-red-500 focus:border-red-500' : ''}
          />
          {!isValidAddress && <p className="mt-1 text-xs text-red-500">Invalid address format</p>}
        </div>

        {/* Amount */}
        <div>
          <label className="mb-2 block text-sm font-medium text-neutral-700">Amount</label>
          <div className="flex gap-2">
            <Input
              placeholder="0.0"
              type="number"
              step="any"
              min="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              className={`flex-1 ${hasInsufficientBalance ? 'border-red-500 focus:border-red-500' : ''}`}
            />
            <Button type="button" variant="secondary" onClick={handleMaxClick}>
              MAX
            </Button>
          </div>
          {hasInsufficientBalance && <p className="mt-1 text-xs text-red-500">Insufficient balance</p>}
        </div>

        {/* Gas Fee */}
        <div className="flex items-center justify-between rounded-md bg-neutral-200 px-3 py-2 text-sm">
          <span className="text-neutral-600">Network Fee</span>
          <span className="text-neutral-800">
            {isEstimating ? (
              <span className="animate-pulse">Estimating...</span>
            ) : gasEstimate ? (
              `~${parseFloat(gasEstimate.estimatedFee).toFixed(6)} ETH`
            ) : (
              '-'
            )}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={handleSendClick} disabled={!canProceed}>
            Continue
          </Button>
        </div>
      </div>
    </>
  );

  const renderConfirmStep = () => (
    <>
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
          <IconArrowOutOfBox className="h-5 w-5 text-amber-700" />
        </div>
        <Dialog.Title className="text-xl font-semibold text-neutral-900">Confirm Transaction</Dialog.Title>
      </div>

      <div className="space-y-4">
        {/* Summary */}
        <div className="rounded-lg bg-neutral-100 p-4">
          <div className="mb-3 flex items-center justify-center gap-2">
            <TokenLogo symbol={selectedToken?.symbol || ''} address={selectedToken?.address} size="md" />
            <span className="text-2xl font-bold text-neutral-900">
              {amount} {selectedToken?.symbol}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-600">To</span>
              <span className="font-mono text-neutral-900">
                {recipient.slice(0, 8)}...{recipient.slice(-6)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-600">Network Fee</span>
              <span className="text-neutral-900">~{parseFloat(gasEstimate?.estimatedFee || '0').toFixed(6)} ETH</span>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-neutral-500">Please review the transaction details before confirming.</p>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep('input')}>
            Back
          </Button>
          <Button type="button" className="flex-1" onClick={handleConfirm}>
            Confirm & Send
          </Button>
        </div>
      </div>
    </>
  );

  const renderPendingStep = () => (
    <>
      <div className="flex flex-col items-center pt-8 pb-4">
        {/* Spinner */}
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800" />

        <Dialog.Title className="mb-2 text-xl font-semibold text-neutral-900">Transaction Pending</Dialog.Title>
        <p className="text-center text-sm text-neutral-600">Please wait while your transaction is being processed...</p>
      </div>

      {txHash && (
        <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="mt-4 w-full">
          <Button type="button" variant="secondary" className="w-full">
            View on Etherscan
          </Button>
        </a>
      )}
    </>
  );

  const renderSuccessStep = () => (
    <>
      <div className="flex flex-col items-center pt-8 pb-4">
        {/* Success Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <Dialog.Title className="mb-2 text-xl font-semibold text-neutral-900">Transaction Successful!</Dialog.Title>
        <p className="text-center text-sm text-neutral-600">
          Your {amount} {selectedToken?.symbol} has been sent successfully.
        </p>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {txHash && (
          <a href={`https://sepolia.etherscan.io/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="w-full">
            <Button type="button" variant="secondary" className="w-full">
              View on Etherscan
            </Button>
          </a>
        )}

        <Button type="button" className="w-full" onClick={handleClose}>
          Done
        </Button>
      </div>
    </>
  );

  const renderErrorStep = () => (
    <>
      <div className="flex flex-col items-center py-8">
        {/* Error Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <Dialog.Title className="mb-2 text-xl font-semibold text-neutral-900">Transaction Failed</Dialog.Title>
        <p className="mb-4 text-center text-sm text-red-600">{error || 'An unexpected error occurred'}</p>

        <div className="flex w-full gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={handleClose}>
            Close
          </Button>
          <Button type="button" className="flex-1" onClick={() => setStep('input')}>
            Try Again
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-neutral-800/50 transition-opacity" />
        <Dialog.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-neutral-100 p-6 shadow-xl">
          {step === 'input' && renderInputStep()}
          {step === 'confirm' && renderConfirmStep()}
          {step === 'pending' && renderPendingStep()}
          {step === 'success' && renderSuccessStep()}
          {step === 'error' && renderErrorStep()}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
