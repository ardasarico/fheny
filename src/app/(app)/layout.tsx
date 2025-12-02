import PageHeader from '@/components/PageHeader';
import Sidebar from '@/components/sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className={'mr-18 flex h-full items-center justify-center'}>
      {' '}
      <Sidebar />
      <div className={'flex h-full w-full max-w-[720px] flex-col border-x border-neutral-300'}>
        <PageHeader />
        {children}
      </div>
    </main>
  );
}
