import { Combobox, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { debounce } from 'lodash';
import { Fragment, useMemo, useRef, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Loading } from '@/components/common/Loading';

export type OptionProps = {
  value: string | number | boolean;
  label: string | React.ReactNode;
};

export type AutoCompleteProps = {
  onSelect?: (value: string | null) => void;
  disabled?: boolean;
  className?: string;
  onFetch?: (value: string) => Promise<OptionProps[]>;
  debounceTimeout?: number; // ms,
  placeholder?: string;
  popupClassName?: string;
  inputClassName?: string;
  inputWrapperClassName?: string;
};

export function AutoComplete(props: AutoCompleteProps) {
  const {
    onSelect,
    onFetch,
    debounceTimeout = 300,
    className,
    disabled,
    placeholder,
    popupClassName,
    inputClassName,
    inputWrapperClassName,
  } = props;

  const [loading, setLoading] = useState<boolean>(true);

  const [options, setOptions] = useState<OptionProps[]>([]);

  const fetchRef = useRef<number>(0);

  const [query, setQuery] = useState('');

  const debounceFetcher = useMemo(() => {
    const loadOptions = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;

      fetchRef.current += 1;

      const fetchId = fetchRef.current;

      setOptions([]);

      setLoading(true);

      setQuery(value);

      if (onFetch) {
        const result = await onFetch(value);

        if (fetchId !== fetchRef.current) {
          // for fetch callback order
          return;
        }

        setOptions(result);
      }

      setLoading(false);
    };

    return debounce(loadOptions, debounceTimeout);
  }, [onFetch, debounceTimeout]);

  const handleOnChange = (value: string | null) => {

    if (onSelect && value) {
      onSelect(value);
    }
  };

  const popupContent = useMemo(() => {
    if (loading) {
      return (
        <div className="relative cursor-default select-none px-4 py-2 text-gray-500 flex flex-col gap-2 items-center">
          <Loading className="text-primary" />
        </div>
      );
    }

    if (options.length === 0) {
      return (
        <div className="relative cursor-default select-none px-4 py-2 text-gray-500 flex flex-col gap-2 items-center">
          <FolderOpenIcon className="w-10 h-10" />
          <p className="text-sm">No data</p>
        </div>
      );
    }

    return options.map((item) => (
      <Combobox.Option
        key={String(item.value)}
        className={({ active }) =>
          `relative cursor-pointer select-none py-2 px-4 ${
            active ? 'bg-gray-100' : 'text-gray-900'
          }`
        }
        value={item.value}
      >
        {item.label}
      </Combobox.Option>
    ));
  }, [loading, options]);

  return (
    <Combobox onChange={handleOnChange} disabled={disabled} value={query}>
      <div className={twMerge('relative', className)}>
        <div
          className={twMerge(
            'relative w-full cursor-default overflow-hidden rounded-md ring-1 ring-gray-300 bg-white text-left focus:outline-none focus-visible:ring-gray-700',
            inputWrapperClassName
          )}
        >
          <Combobox.Input
            className={twMerge(
              'w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-1 rounded-md focus-visible:outline-gray-500',
              inputClassName
            )}
            onChange={debounceFetcher}
            placeholder={placeholder}
          />
          <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronDownIcon
              className="h-5 w-5 text-gray-500"
              aria-hidden="true"
            />
          </Combobox.Button>
        </div>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Combobox.Options
            className={twMerge(
              'absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none text-sm custom-scrollbar',
              popupClassName
            )}
          >
            {popupContent}
          </Combobox.Options>
        </Transition>
      </div>
    </Combobox>
  );
}
