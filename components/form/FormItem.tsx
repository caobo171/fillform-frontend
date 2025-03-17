import { CircleStackIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

type FormItemProps = {
  label: string;
  error?: string;
  optional?: boolean;
  className?: string;
  children: React.ReactNode;
  coinNumber?: number;
  coinBlockClassName?: string;
};

export function FormItem(props: FormItemProps) {
  const {
    label,
    error,
    optional,
    className,
    coinNumber,
    coinBlockClassName,
    children,
  } = props;

  const mainBlock = useMemo(() => {
    if (!coinNumber) {
      return children;
    }

    return (
      <div className="relative">
        {children}

        <span
          className={twMerge(
            'flex items-center gap-1 absolute z-1 right-2 top-2.5',
            coinNumber < 0 ? 'text-red-500' : 'text-green-500',
            coinBlockClassName
          )}
        >
          +{coinNumber}
          <CircleStackIcon className="w-[14px] h-[14px] text-orange-500" />
        </span>
      </div>
    );
  }, [coinNumber, coinBlockClassName, children]);

  return (
    <div
      className={clsx(
        'relative flex flex-col gap-2',
        {
          '[&>input]border-red-500 [&>input]focus:border-red-500': error,
        },
        className
      )}
    >
      <label>
        {label}
        {optional && <span className="text-gray-400"> (optional)</span>}
      </label>

      {mainBlock}

      {error && (
        <span className="absolute z-1 left-0 bottom-0 translate-y-full text-red-500">
          {error}
        </span>
      )}
    </div>
  );
}
