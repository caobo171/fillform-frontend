import React from 'react';
import clsx from 'clsx';

type InputProps = {
  className?: string;
  disabled?: boolean;
  type?: 'text' | 'number' | 'date' | 'datetime-local';
};

export function Input(props: InputProps) {
  const { className, disabled, type = 'text', ...rest } = props;
  return (
    <input
      type={type}
      className={clsx(
        'outline-none rounded border border-solid border-gray-400 py-[5px] px-[11px]',
        'focus:border-gray-900 focus:shadow-sm',
        {
          'pointer-events-none bg-gray-100': disabled,
        },
        className
      )}
      {...rest}
    />
  );
}
