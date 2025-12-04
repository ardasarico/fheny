'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { importWallet } from '@/lib/importWallet';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// icons
import IconHugeWallet from '@icon/huge-wallet.svg';
import IconPlus from '@icon/plus.svg';
import Link from 'next/link';

const COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Page = () => {
  const router = useRouter();
  const [privateKey, setPrivateKey] = useState('');
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImport = async () => {
    setError(null);

    if (!privateKey.trim()) {
      setError('Please enter your private key');
      return;
    }

    if (!name.trim()) {
      setError('Please enter a wallet name');
      return;
    }

    // Basic validation for private key format
    const cleanKey = privateKey.trim();
    if (!cleanKey.startsWith('0x') || cleanKey.length !== 66) {
      setError('Invalid private key format. It should start with 0x and be 66 characters long.');
      return;
    }

    setIsImporting(true);
    try {
      importWallet(cleanKey as `0x${string}`, name.trim(), selectedColor);
      router.push('/');
    } catch (err) {
      console.error('Failed to import wallet:', err);
      setError(err instanceof Error ? err.message : 'Failed to import wallet');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className={'mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center gap-12'}>
      <div className={'text-8xl'}>
        <IconHugeWallet />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2 text-center'}>
        <h1 className={'text-4xl font-semibold text-neutral-800'}>Import Wallet</h1>
        <p className={'max-w-[520px] text-balance text-neutral-700'}>
          Import an existing wallet using your private key. Make sure you're in a private and secure place.
        </p>
      </div>
      <div className={'flex flex-col items-center gap-4'}>
        <Input className={'min-w-[400px]'} placeholder={'Enter wallet name'} value={name} onChange={e => setName(e.target.value)} />
        <Input
          className={'min-w-[400px]'}
          type={'password'}
          placeholder={'Enter Private Key (0x...)'}
          value={privateKey}
          onChange={e => setPrivateKey(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleImport();
            }
          }}
        />
        <div className={'flex flex-col items-center gap-3'}>
          <p className={'text-sm text-neutral-700'}>Choose a color</p>
          <div className={'flex gap-2'}>
            {COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`aspect-square h-8 rounded-sm border-2 transition-all ${
                  selectedColor === color ? 'scale-110 border-neutral-800' : 'border-neutral-400 hover:border-neutral-600'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        {error && <p className={'text-sm text-red-600'}>{error}</p>}
        <Button onClick={handleImport} disabled={!privateKey.trim() || !name.trim() || isImporting}>
          <IconPlus /> {isImporting ? 'Importing...' : 'Import Wallet'}
        </Button>
      </div>
      <div className={'flex items-center gap-2 text-neutral-700'}>
        Don't have a wallet?{' '}
        <Link href={'/create-wallet'} className={'cursor-pointer font-medium text-neutral-800'}>
          Create New
        </Link>
      </div>
    </div>
  );
};

export default Page;
