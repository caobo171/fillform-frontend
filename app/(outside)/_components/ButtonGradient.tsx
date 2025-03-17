import clsx from 'clsx';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonGradientProps = {
  type?: 'text' | 'outlined' | 'solid';
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
  loading?: boolean;
};

export function ButtonGradient(props: ButtonGradientProps) {
  const { type = 'solid', className, children, onClick, loading } = props;

  return (
    <button
      onClick={onClick}
      className={twMerge(
        'text-white text-base font-medium py-3 px-6 rounded-full flex justify-center items-center',
        clsx({
          'bg-gradient-to-r from-primary to-primary-dark hover:bg-gradient-to-l':
            type === 'solid',
          'ring-1 ring-primary text-primary bg-transparent hover:text-white hover:bg-gradient-to-r hover:from-primary hover:to-primary-dark':
            type === 'outlined',
          'text-primary bg-transparent ring-1 ring-transparent transition-all hover:ring-primary':
            type === 'text',
          'pointer-events-none opacity-50': loading,
        }),
        className
      )}
    >
      {children}
    </button>
  );
}
