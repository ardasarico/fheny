import { Menu } from '@base-ui-components/react/menu';

//icons
import IconChevronDown from '@icon/chevron-down.svg';
import IconPencil from '@icon/pencil.svg';
import IconPlus from '@icon/plus.svg';

const accounts = [
  { id: 1, name: 'Main Wallet', color: '#6B7280' },
  { id: 2, name: 'Work Wallet', color: '#3B82F6' },
  { id: 3, name: 'Test Wallet', color: '#10B981' },
];

export default function AccountSelector() {
  const selected = accounts[0];

  return (
    <Menu.Root>
      <Menu.Trigger className="flex h-full items-center gap-2 px-4 transition duration-150 ease-out hover:bg-neutral-200 data-[popup-open]:bg-neutral-200">
        <div className="aspect-square h-4 rounded-sm" style={{ backgroundColor: selected.color }} />
        <p className="mr-3 text-sm text-neutral-800">{selected.name}</p>
        <IconChevronDown className="text-neutral-600" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner align={'end'} style={{ minWidth: 'var(--anchor-width)' }}>
          <Menu.Popup className="border border-neutral-300 bg-neutral-200">
            {accounts
              .filter(acc => acc.id !== selected.id)
              .map(acc => (
                <Menu.Item key={acc.id} className="flex cursor-default items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-300">
                  <div className="aspect-square h-4 rounded-sm" style={{ backgroundColor: acc.color }} />
                  <p>{acc.name}</p>
                </Menu.Item>
              ))}

            <Menu.Separator className="mx-4 my-1 h-px bg-neutral-400" />

            <Menu.Item className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-300">
              <div className="grid aspect-square h-4 place-content-center">
                <IconPlus />
              </div>
              New Account
            </Menu.Item>
            <Menu.Item className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm text-neutral-900 hover:bg-neutral-300">
              <div className="grid aspect-square h-4 place-content-center">
                <IconPencil />
              </div>
              Edit Accounts
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
