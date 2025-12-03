import { Input as BaseInput } from '@base-ui-components/react/input';

export type InputProps = React.ComponentPropsWithoutRef<typeof BaseInput>;

export function Input({ className, placeholder, ...props }: InputProps) {
  return (
    <BaseInput
      placeholder={placeholder || 'Input placeholder'}
      className={`w-full rounded-xs border border-neutral-300 bg-neutral-200 px-5 py-2.5 focus:border-neutral-600 focus:outline-none ${className ?? ''}`}
      {...props}
    />
  );
}
