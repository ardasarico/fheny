'use client';

import AddTokenModal from '@/components/AddTokenModal';
import { Button } from '@/components/Button';
import { Switch } from '@/components/Switch';
import TokenLogo from '@/components/TokenLogo';
import { useTokenStore } from '@/store/useTokenStore';
import { useWalletStore } from '@/store/useWalletStore';
import { useEffect, useState } from 'react';

import IconChevronDown from '@icon/chevron-down.svg';
import IconGear from '@icon/gear.svg';

export default function Settings() {
  const [mounted, setMounted] = useState(false);
  const [isAddTokenModalOpen, setIsAddTokenModalOpen] = useState(false);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [backupCopied, setBackupCopied] = useState(false);

  // Settings state
  const [network, setNetwork] = useState<'sepolia' | 'mainnet'>('sepolia');
  const [currency, setCurrency] = useState('USD');
  const [notifications, setNotifications] = useState(true);
  const [autoLock, setAutoLock] = useState('5');

  const wallets = useWalletStore(state => state.wallets);
  const activeWallet = useWalletStore(state => state.wallets.find(w => w.id === state.activeWalletId));
  const tokens = useTokenStore(state => state.tokens);
  const removeToken = useTokenStore(state => state.removeToken);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleBackupWallets = () => {
    if (wallets.length === 0) return;

    const backupData = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      wallets: wallets.map(w => ({
        name: w.name,
        address: w.address,
        privateKey: w.privateKey,
        color: w.color,
        imported: w.imported,
        createdAt: w.createdAt,
      })),
    };

    // Create and download file
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fheniy-backup-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setBackupCopied(true);
    setTimeout(() => setBackupCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="flex h-full flex-col">
        <div className="animate-pulse space-y-px bg-white">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 bg-neutral-100" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      {/* Network Section */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Network</span>
      </div>
      <div className="divide-y divide-neutral-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Active Network</span>
          <select
            value={network}
            onChange={e => setNetwork(e.target.value as 'sepolia' | 'mainnet')}
            className="rounded-xs border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="sepolia">Sepolia Testnet</option>
            <option value="mainnet" disabled>
              Mainnet (Soon)
            </option>
          </select>
        </div>
        {network === 'sepolia' && (
          <div className="bg-amber-50 px-4 py-2">
            <p className="text-xs text-amber-700">⚠️ Testnet mode - tokens have no real value</p>
          </div>
        )}
      </div>

      {/* Preferences Section */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Preferences</span>
      </div>
      <div className="divide-y divide-neutral-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Display Currency</span>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="rounded-xs border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="TRY">TRY (₺)</option>
          </select>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Auto-Lock</span>
          <select
            value={autoLock}
            onChange={e => setAutoLock(e.target.value)}
            className="rounded-xs border border-neutral-300 bg-neutral-100 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="1">1 minute</option>
            <option value="5">5 minutes</option>
            <option value="15">15 minutes</option>
            <option value="30">30 minutes</option>
            <option value="never">Never</option>
          </select>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Transaction Notifications</span>
          <Switch checked={notifications} onCheckedChange={setNotifications} />
        </div>
      </div>

      {/* Security Section */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Security</span>
      </div>
      <div className="divide-y divide-neutral-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-neutral-800">Biometric Authentication</span>
            <span className="rounded-xs bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-500">Coming Soon</span>
          </div>
          <Switch checked={false} onCheckedChange={() => {}} disabled />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <span className="text-neutral-800">Backup All Wallets</span>
            <p className="text-xs text-neutral-500">Download wallet backup as file</p>
          </div>
          <Button variant="secondary" size="md" onClick={handleBackupWallets} disabled={wallets.length === 0}>
            {backupCopied ? '✓ Downloaded' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Custom Tokens Section */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Custom Tokens</span>
      </div>
      <div className="divide-y divide-neutral-200 bg-white">
        {tokens.length === 0 ? (
          <div className="px-4 py-6 text-center">
            <p className="text-sm text-neutral-500">No custom tokens added</p>
          </div>
        ) : (
          tokens.map(token => (
            <div key={token.address} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <TokenLogo symbol={token.symbol} address={token.address} size="sm" />
                <div>
                  <p className="font-medium text-neutral-800">{token.symbol}</p>
                  <p className="font-mono text-xs text-neutral-500">
                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                  </p>
                </div>
              </div>
              <button onClick={() => removeToken(token.address)} className="rounded-xs px-2 py-1 text-sm text-red-600 transition hover:bg-red-50">
                Remove
              </button>
            </div>
          ))
        )}
        <div className="px-4 py-3">
          <Button size="md" onClick={() => setIsAddTokenModalOpen(true)} className="w-full">
            Add Token
          </Button>
        </div>
      </div>

      {/* About Section */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">About</span>
      </div>
      <div className="divide-y divide-neutral-200 bg-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Version</span>
          <span className="text-sm text-neutral-500">1.0.0-beta</span>
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-neutral-800">Build</span>
          <span className="font-mono text-sm text-neutral-500">2025.12.04</span>
        </div>
      </div>

      {/* Developer Options */}
      <div className="border-b border-neutral-200 bg-neutral-100 px-4 py-2">
        <button onClick={() => setShowDevOptions(!showDevOptions)} className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <IconGear className="h-4 w-4 text-neutral-500" />
            <span className="text-xs font-medium tracking-wide text-neutral-500 uppercase">Developer Options</span>
          </div>
          <IconChevronDown className={`h-4 w-4 text-neutral-500 transition-transform ${showDevOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {showDevOptions && (
        <div className="divide-y divide-neutral-200 bg-white">
          <div className="px-4 py-3">
            <p className="mb-1 text-xs font-medium text-neutral-500">Active Wallet ID</p>
            <code className="block rounded-xs bg-neutral-100 px-2 py-1 font-mono text-xs text-neutral-700">{activeWallet?.id || 'No active wallet'}</code>
          </div>
          <div className="px-4 py-3">
            <p className="mb-1 text-xs font-medium text-neutral-500">All Wallets (JSON)</p>
            <pre className="max-h-32 overflow-auto rounded-xs bg-neutral-100 p-2 font-mono text-xs text-neutral-700">{JSON.stringify(wallets, null, 2)}</pre>
          </div>
          {activeWallet && (
            <div className="px-4 py-3">
              <p className="mb-1 text-xs font-medium text-neutral-500">Active Wallet Details</p>
              <pre className="max-h-32 overflow-auto rounded-xs bg-neutral-100 p-2 font-mono text-xs text-neutral-700">
                {JSON.stringify(activeWallet, null, 2)}
              </pre>
            </div>
          )}
          <div className="bg-red-50 px-4 py-2">
            <p className="text-xs text-red-600">⚠️ Debug info only. Never share your private keys.</p>
          </div>
        </div>
      )}

      {/* Bottom Spacer */}
      <div className="flex-1 bg-neutral-100" />

      <AddTokenModal isOpen={isAddTokenModalOpen} onClose={() => setIsAddTokenModalOpen(false)} />
    </div>
  );
}
