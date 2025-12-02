import { Button } from '@/components/Button';
import { Input } from '@/components/Input';

//icons
import IconHugeWallet from '@icon/huge-wallet.svg';
import IconPlus from '@icon/plus.svg';
import Link from 'next/link';

const Page = () => {
  return (
    <div className={'mx-auto flex h-full w-full max-w-[720px] flex-col items-center justify-center gap-12'}>
      <div className={'text-8xl'}>
        <IconHugeWallet />
      </div>
      <div className={'flex flex-col items-center justify-center gap-2 text-center'}>
        <h1 className={'text-4xl font-semibold text-neutral-800'}>Import Wallet</h1>
        <p className={'max-w-[520px] text-balance text-neutral-700'}>
          Import an existing wallet using your private key. Make sure you’re in a private and secure place.
        </p>
      </div>
      <div className={'flex flex-col items-center gap-4'}>
        <Input className={'min-w-[400px]'} type={'password'} placeholder={'Enter Private Key'} />
        <Button>
          <IconPlus /> Import Wallet
        </Button>
      </div>
      <div className={'flex items-center gap-2 text-neutral-700'}>
        Don't have a wallet?{' '}
        <Link href={'/import-wallet'} className={'cursor-pointer font-medium text-neutral-800'}>
          Create New
        </Link>
      </div>
    </div>
  );
};

export default Page;
