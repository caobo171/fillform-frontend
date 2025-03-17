import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type PremiumIconProps = {
  border?: boolean;
  className?: string;
};

export function PremiumIcon({ border, className }: PremiumIconProps) {
  return (
    <span
      className={twMerge(
        'flex items-center justify-center',
        clsx({
          'w-3.5 h-3.5 rounded-full bg-yellow-50 ring-1 ring-yellow-500':
            border,
        }),
        className
      )}
      title="Premium Plan"
    >
      <Image
        width={border ? 10 : 16}
        height={border ? 10 : 16}
        src="/static/svg/crown.svg"
        alt="premium"
      />
    </span>
  );
}
