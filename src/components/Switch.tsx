'use client';

import { Switch as BaseSwitch } from '@base-ui-components/react/switch';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Switch({ checked, onCheckedChange, disabled = false }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      className={`flex h-5 w-9 items-center rounded-xs border px-0.5 transition-colors ${
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
      } ${checked ? 'justify-end border-neutral-800 bg-neutral-800' : 'justify-start border-neutral-300 bg-neutral-200'}`}
    >
      <BaseSwitch.Thumb
        className={`h-3.5 w-3.5 rounded-xs transition-colors ${checked ? 'bg-neutral-100' : 'bg-neutral-600'}`}
      />
    </BaseSwitch.Root>
  );
}

