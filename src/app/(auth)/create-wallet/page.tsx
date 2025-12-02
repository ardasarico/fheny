'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { createWallet } from '@/lib/createWallet';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

//icons
import IconHugeWallet from '@icon/huge-wallet.svg';
import IconPlus from '@icon/plus.svg';
import Link from 'next/link';

const COLORS = ['#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6'];

const Page = () => {
  const router = useRouter();
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      createWallet(name.trim(), selectedColor);
      router.push('/');
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className={'mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center gap-12'}>
      <div className={'text-8xl'}>
        <IconHugeWallet />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2 text-center'}>
        <h1 className={'text-4xl font-semibold text-neutral-800'}>Create Wallet</h1>
        <p className={'max-w-[520px] text-balance text-neutral-700'}>Choose a name and color for your wallet. You can update these anytime after creating it</p>
      </div>
      <div className={'flex flex-col items-center gap-4'}>
        <Input
          className={'min-w-[400px]'}
          placeholder={'Enter wallet name'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleCreate();
            }
          }}
        />
        <div className={'flex flex-col items-center gap-3'}>
          <p className={'text-sm text-neutral-700'}>Choose a color</p>
          <div className={'flex gap-2'}>
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                className={`aspect-square h-8 rounded-sm border-2 transition-all ${
                  selectedColor === color ? 'border-neutral-800 scale-110' : 'border-neutral-400 hover:border-neutral-600'
                }`}
                style={{ backgroundColor: color }}
                aria-label={`Select color ${color}`}
              />
            ))}
          </div>
        </div>
        <Button onClick={handleCreate} disabled={!name.trim() || isCreating}>
          <IconPlus /> {isCreating ? 'Creating...' : 'Create Wallet'}
        </Button>
      </div>
      <div className={'flex items-center gap-2 text-neutral-700'}>
        Already have a wallet?{' '}
        <Link href={'/import-wallet'} className={'cursor-pointer font-medium text-neutral-800'}>
          Import
        </Link>
      </div>
    </div>
  );
};

export default Page;
