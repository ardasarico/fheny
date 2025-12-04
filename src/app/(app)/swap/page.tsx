'use client';

import IconArrowsRepeat from '@icon/arrows-repeat.svg';

const Page = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100">
        <IconArrowsRepeat className="h-12 w-12 text-cyan-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-800">Token Swap</h3>
      <p className="mb-6 max-w-xs text-sm text-neutral-500">
        Swap tokens directly from your wallet with the best rates from decentralized exchanges.
      </p>
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-4">
        <p className="text-xs text-neutral-500">Coming soon: Swap tokens with 0x or Uniswap</p>
      </div>
    </div>
  );
};

export default Page;
