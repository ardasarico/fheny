'use client';

import IconApps from '@icon/apps.svg';

const Page = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100">
        <IconApps className="h-12 w-12 text-purple-400" />
      </div>
      <h3 className="mb-2 text-xl font-semibold text-neutral-800">No connected apps</h3>
      <p className="mb-6 max-w-xs text-sm text-neutral-500">
        When you connect to decentralized applications, they&apos;ll appear here for easy management.
      </p>
      <div className="rounded-xl border border-dashed border-neutral-300 bg-neutral-50 px-6 py-4">
        <p className="text-xs text-neutral-500">Coming soon: Connect to dApps with WalletConnect</p>
      </div>
    </div>
  );
};

export default Page;
