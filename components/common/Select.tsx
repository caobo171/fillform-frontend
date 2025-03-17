import { Listbox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { Fragment, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

export type OptionProps = {
  value: string | number | boolean;
  label: string | React.ReactNode;
};

export type SelectProps = {
  value?: string | number | boolean;
  onChange?: (value: string | number | boolean) => void;
  disabled?: boolean;
  options: OptionProps[];
  multiple?: boolean;
  className?: string;
  labelClassName?: string;
  popupClassName?: string;
  placeholder?: string;
  size?: 'small' | 'medium' | 'large' | 'x-large';
};

export function Select(props: SelectProps) {
  const {
    value,
    onChange,
    disabled,
    options,
    multiple,
    className,
    labelClassName,
    popupClassName,
    placeholder,
    size = 'medium',
  } = props;

  const [selected, setSelected] = useState<OptionProps>();

  const handleOnChange = (val: string | number | boolean) => {
    const s = options.find((item) => item.value === val);

    setSelected(s);

    if (onChange) {
      onChange(val);
    }
  };

  useEffect(() => {
    const selectedOption = options.find((item) => item.value === value);

    setSelected(selectedOption);
  }, [value, options]);

  return (
    <Listbox
      value={value}
      onChange={handleOnChange}
      disabled={disabled}
      multiple={multiple}
    >
      <div className={clsx('relative', className)}>
        <Listbox.Button
          className={twMerge(
            'relative w-full cursor-pointer rounded-md bg-white pl-3 pr-10 text-gray-900 text-left ring-1 ring-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-orange-300 sm:text-sm',
            clsx({
              'py-[5px]': size === 'small',
              'py-[7px]': size === 'medium',
              'py-[9px]': size === 'large',
              'py-[11px] px-4 sm:text-base': size === 'x-large',
            }),
            labelClassName
          )}
        >
          <span className="block truncate">
            {selected?.label ?? placeholder}
          </span>
          <span className="pointer-events-none absolute z-1 inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>

        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options
            className={twMerge(
              'absolute z-2 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none text-sm custom-scrollbar',
              popupClassName
            )}
          >
            {options.map((option) => (
              <Listbox.Option
                key={String(option.value)}
                className={({ active }) =>
                  `relative cursor-pointer select-none py-2 px-4 ${
                    active ? 'bg-gray-100' : 'text-gray-900'
                  }`
                }
                value={option.value}
              >
                <span
                  className={`truncate flex gap-2 ${
                    option.value === selected?.value
                      ? 'text-primary'
                      : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </span>
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
