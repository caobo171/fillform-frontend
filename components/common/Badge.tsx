import clsx from 'clsx';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type BadgeProps = {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  type:
    | 'primary'
    | 'gray'
    | 'red'
    | 'yellow'
    | 'green'
    | 'blue'
    | 'purple'
    | 'orange'
    | 'indigo'
    | 'pink';
};

export function Badge(props: BadgeProps) {
  const { className, children, type = 'gray', onClick } = props;

  return (
    <span
      aria-hidden="true"
      className={twMerge(
        clsx(
          'inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs',
          {
            'bg-primary-50 text-primary': type === 'primary',
          },
          {
            'bg-gray-100 text-gray-600': type === 'gray',
          },
          {
            'bg-red-100 text-red-700': type === 'red',
          },
          {
            'bg-yellow-100 text-yellow-800': type === 'yellow',
          },
          {
            'bg-green-100 text-green-700': type === 'green',
          },
          {
            'bg-blue-100 text-blue-700': type === 'blue',
          },
          {
            'bg-purple-100 text-purple-700': type === 'purple',
          },
          {
            'bg-orange-100 text-orange-600': type === 'orange',
          },
          {
            'bg-indigo-100 text-indigo-700': type === 'indigo',
          },
          {
            'bg-pink-100 text-pink-700': type === 'pink',
          },
          className
        )
      )}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
