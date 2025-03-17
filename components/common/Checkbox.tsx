import { Checkbox as CheckboxHeadless, Field, Label } from '@headlessui/react';
import { CheckIcon } from '@heroicons/react/16/solid';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

type CheckboxProps = {
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
  value?: boolean;
  onChange?: (checked: boolean) => void;
};

export function Checkbox(props: CheckboxProps) {
  const { className, children, value, onChange, ...rest } = props;

  const [checked, setChecked] = useState<boolean>(Boolean(value));

  const handleOnChange = (val: boolean) => {
    setChecked(val);

    if (onChange) {
      onChange(val);
    }
  };

  useEffect(() => {
    setChecked(Boolean(value));
  }, [value]);

  return (
    <Field className={twMerge('flex items-center gap-2', className)}>
      <CheckboxHeadless
        className={twMerge(
          'flex flex-shrink-0 items-center justify-center group h-4 w-4 rounded-[4px] bg-white ring-1 ring-gray-400 ring-inset',
          'data-[checked]:bg-primary data-[checked]:ring-primary cursor-pointer'
        )}
        checked={checked}
        onChange={handleOnChange}
        {...rest}
      >
        <CheckIcon className="hidden h-4 w-4 fill-white group-data-[checked]:block" />
      </CheckboxHeadless>

      {children && (
        <Label className="text-sm text-gray-900 cursor-pointer select-none">
          {children}
        </Label>
      )}
    </Field>
  );
}
