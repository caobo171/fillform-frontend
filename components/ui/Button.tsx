import clsx from 'clsx';
import Link from 'next/link';
import React, { useMemo } from 'react';

export const ShowMoreButton = React.memo(
  ({ onClick, className, title }: any) => (
    <button
      onClick={onClick}
      name="show-more"
      className={`${className} outline-none focus:outline-none px-3 py-1 border-2 border-blue-400 rounded text-blue-400 font-medium hover:border-blue-700 hover:text-blue-700 transition-all`}
    >
      {title || 'Show all'}
    </button>
  )
);

const baseStyles = {
  solid:
    'group inline-flex items-center justify-center rounded py-1.5 px-4 text-sm font-semibold focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2',
  outline:
    'group inline-flex ring-1 items-center justify-center rounded py-1.5 px-4 text-sm focus:outline-none',
  secondary:
    'group inline-flex items-center justify-center rounded py-1.5 px-4 text-sm focus:outline-none',
};

const variantStyles = {
  solid: {
    slate:
      'bg-slate-900 text-white hover:bg-slate-700 hover:text-slate-100 active:bg-slate-800 active:text-slate-300 focus-visible:outline-slate-900',
    blue: 'bg-blue-600 text-white hover:text-slate-100 hover:bg-blue-500 active:bg-blue-800 active:text-blue-100 focus-visible:outline-blue-600',
    green:
      'bg-green-600 text-white hover:text-slate-100 hover:bg-green-500 active:bg-green-800 active:text-green-100 focus-visible:outline-green-600',
    white:
      'bg-white text-slate-900 hover:bg-blue-50 active:bg-blue-200 active:text-slate-600 focus-visible:outline-white',
    primary:
      'bg-primary text-white hover:text-slate-100 hover:bg-primary-900 active:bg-primary-800 active:text-primary-100 focus-visible:outline-primary-600',
  },
  outline: {
    slate:
      'ring-slate-200 text-slate-700 hover:text-slate-900 hover:ring-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
    white:
      'ring-slate-700 text-white hover:ring-slate-500 active:ring-slate-700 active:text-slate-400 focus-visible:outline-white',
    primary:
      'ring-primary-200 text-primary-700 hover:text-primary-900 hover:ring-primary-300 active:bg-primary-100 active:text-primary-600 focus-visible:outline-blue-600 focus-visible:ring-primary-300',
  },
  secondary: {
    slate:
      'bg-slate-200 text-slate-700 hover:text-slate-900 bg:bg-slate-300 active:bg-slate-100 active:text-slate-600 focus-visible:outline-blue-600 focus-visible:ring-slate-300',
    primary: 'bg-primary-100 text-primary hover:text-white hover:bg-primary',
  },
};

type ButtonProps = (
  | {
      variant?: 'solid';
      color?: keyof typeof variantStyles.solid;
    }
  | {
      variant: 'outline';
      color?: keyof typeof variantStyles.outline;
    }
  | {
      variant: 'secondary';
      color?: keyof typeof variantStyles.secondary;
    }
) &
  (
    | Omit<React.ComponentPropsWithoutRef<typeof Link>, 'color'>
    | (Omit<React.ComponentPropsWithoutRef<'button'>, 'color'> & {
        href?: undefined;
      })
  );

ShowMoreButton.displayName = 'ShowMoreButton';

export function UIButton({ className, ...props }: ButtonProps) {
  props.variant ??= 'solid';
  props.color ??= 'primary';

  className = clsx(
    baseStyles[props.variant],
    props.variant === 'outline'
      ? variantStyles.outline[props.color]
      : props.variant === 'solid'
        ? variantStyles.solid[props.color]
        : props.variant === 'secondary'
          ? variantStyles.secondary[props.color]
          : undefined,
    className
  );

  return typeof props.href === 'undefined' ? (
    <button className={className} {...props} />
  ) : (
    <Link className={className} {...props} />
  );
}

// New UI for buttons
// Don't want to mess up with old styles now
// TODO:
// Will do the refactor to replace old button with new ones later

type NewButtonProps = {
  type?: 'solid' | 'outline' | 'text' | 'link';
  size?: 'small' | 'medium' | 'large';
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  htmlType?: 'button' | 'reset' | 'submit';
  disabled?: boolean;
  loading?: boolean;
};

export function Button({
  type = 'solid',
  size = 'medium',
  className,
  children,
  href,
  onClick,
  htmlType,
  disabled,
  loading,
}: NewButtonProps) {
  const twClass = useMemo(() => {
    let cls: string =
      'rounded outline-none select-none font-medium inline-flex gap-2 items-center justify-center';

    switch (type) {
      case 'solid': {
        cls += ' text-white bg-primary hover:bg-primary-900';
        break;
      }
      case 'outline': {
        cls +=
          ' text-primary bg-white hover:bg-primary-50 border border-solid border-primary';
        break;
      }
      case 'text': {
        cls += ' text-primary hover:bg-primary-50';
        break;
      }
      case 'link': {
        cls += ' text-primary';
      }
    }

    switch (size) {
      case 'small': {
        cls += ' text-sm h-8 px-4';
        break;
      }
      case 'medium': {
        cls += ' text-sm h-10 px-6';
        break;
      }
      case 'large': {
        cls += ' text-base h-12 px-8';
        break;
      }
    }

    return cls;
  }, [size, type]);

  if (type === 'link') {
    return (
      <a href={href} className={clsx(twClass, className)} rel="noopener">
        {children}
      </a>
    );
  }

  return (
    <button
      className={clsx(
        twClass,
        { 'pointer-events-none opacity-50': disabled },
        className
      )}
      onClick={onClick}
      type={htmlType}
      disabled={disabled}
    >
      {loading && (
        <svg
          className="animate-spin h-4 w-4 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
