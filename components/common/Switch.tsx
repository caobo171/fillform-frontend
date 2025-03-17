import { Switch as HeadlessSwitch } from '@headlessui/react';
import clsx from 'clsx';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type SwitchProps = {
  value?: boolean;
  onChange?: (val: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
  disable?: boolean;
};

export function Switch(props: SwitchProps) {
  const { value, onChange, className, size = 'md', disable } = props;

  const [enabled, setEnabled] = useState(false);

  const handleOnChange = useCallback(
    (checked: boolean) => {
      setEnabled(checked);

      if (onChange) {
        onChange(checked);
      }
    },
    [onChange]
  );

  useEffect(() => {
    setEnabled(!!value);
  }, [value]);

  return (
    <HeadlessSwitch
      checked={enabled}
      onChange={handleOnChange}
      className={twMerge(
        'group relative flex h-6 w-11 cursor-pointer rounded-full bg-gray-200 p-1 transition-colors duration-200 ease-in-out focus:outline-none data-[focus]:outline-1 data-[focus]:outline-white data-[checked]:bg-primary',
        clsx({
          'h-5 w-8': size === 'sm',
          'pointer-events-none opacity-80': disable,
        }),
        className
      )}
    >
      <span
        aria-hidden="true"
        className={twMerge(
          'pointer-events-none inline-block size-4 translate-x-0 rounded-full bg-white ring-0 shadow-lg transition duration-200 ease-in-out group-data-[checked]:translate-x-5',
          clsx({
            'size-3 group-data-[checked]:translate-x-3': size === 'sm',
          })
        )}
      />
    </HeadlessSwitch>
  );
}
