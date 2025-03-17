import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

export type InputProps = {
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  suffixIcon?: React.ReactNode;
  prefixIcon?: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'x-large';
  type?: 'text' | 'number' | 'date' | 'datetime-local' | 'password';
  state?: 'normal' | 'error' | 'success';
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  ref?: React.RefCallback<HTMLInputElement>;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

// only disable this rule for forwardRef
// eslint-disable-next-line react/display-name
export const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    className,
    disabled,
    size = 'medium',
    type = 'text',
    state = 'normal',
    placeholder,
    prefixIcon,
    suffixIcon,
    inputClassName,
    iconClassName,
    ...rest
  } = props;

  return (
    <div
      className={twMerge(
        'w-full flex items-center rounded-md p-0.5 ring-1 ring-inset ring-gray-300 focus-within:ring-inset focus-within:ring-gray-700 focus-within:shadow-sm bg-white',
        clsx({
          'h-8': size === 'small',
          'h-9': size === 'medium',
          'h-10': size === 'large',
          'h-12 rounded-lg': size === 'x-large',
          'ring-red-600 focus-within:ring-red-600': state === 'error',
          'ring-lime-600 focus-within:ring-lime-600': state === 'success',
        }),
        className
      )}
    >
      {prefixIcon && (
        <span
          className={twMerge(
            'flex select-none items-center pl-3 text-gray-500 text-sm',
            iconClassName
          )}
        >
          {prefixIcon}
        </span>
      )}

      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        className={twMerge(
          // using text-base on mobile to avoid auto zoom
          'block flex-1 h-full rounded-md outline-none border-0 bg-transparent pl-3 pr-3 text-gray-900 placeholder:text-gray-400 focus:ring-0 text-base sm:text-sm leading-6',
          clsx({
            'pl-2': !!prefixIcon,
            'pr-2': !!suffixIcon,
            'pointer-events-none': disabled,
            'rounded-lg px-4 sm:text-base': size === 'x-large',
          }),
          inputClassName
        )}
        {...rest}
      />

      {suffixIcon && (
        <span
          className={twMerge(
            'flex select-none items-center pl-3 text-gray-500 text-sm',
            iconClassName
          )}
        >
          {suffixIcon}
        </span>
      )}

      {state !== 'normal' && (
        <span className="p-3 rounded-lg">
          {state === 'error' && (
            <XCircleIcon className="w-6 h-6 text-red-600" />
          )}

          {state === 'success' && (
            <CheckCircleIcon className="w-6 h-6 text-lime-600" />
          )}
        </span>
      )}
    </div>
  );
});
