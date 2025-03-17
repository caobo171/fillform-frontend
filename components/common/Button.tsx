import clsx from 'clsx';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

export type ButtonProps = {
  type?: 'solid' | 'outline' | 'text' | 'secondary';
  size?: 'small' | 'medium' | 'large' | 'x-large';
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  htmlType?: 'button' | 'reset' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  rounded?: boolean;
  title?: string;
  style?: React.CSSProperties;
};

export function Button({
  type = 'solid',
  size = 'medium',
  className,
  children,
  onClick,
  disabled,
  loading,
  htmlType,
  rounded,
  title,
  style,
}: ButtonProps) {
  const twClass = useMemo(() => {
    let cls: string =
      'inline-flex items-center justify-center gap-2 outline-none rounded-md text-sm font-medium';

    switch (type) {
      case 'solid': {
        cls = twMerge(
          cls,
          'text-white bg-primary hover:bg-primary-900 focus-visible:outline-primary-900'
        );
        break;
      }
      case 'outline': {
        cls = twMerge(
          cls,
          // keep ring-[1.1px] to avoid background overlap
          'text-primary bg-white hover:bg-primary-50 focus-visible:outline-primary-50 ring-[1.1px] ring-primary'
        );
        break;
      }
      case 'secondary': {
        cls = twMerge(
          cls,
          // keep ring-[1.1px] to avoid background overlap
          'text-gray-900 bg-white hover:bg-gray-50 focus-visible:outline-gray-300 ring-[1.1px] ring-gray-300'
        );
        break;
      }
      case 'text': {
        cls = twMerge(cls, 'text-primary bg-transparent hover:bg-primary-50');
        break;
      }
      default: {
        return '';
      }
    }

    switch (size) {
      case 'small': {
        cls = twMerge(cls, 'px-1 px-4 py-1.5');
        break;
      }
      case 'medium': {
        cls = twMerge(cls, 'px-1 px-4 py-2');
        break;
      }
      case 'large': {
        cls = twMerge(cls, 'px-6 py-2.5');
        break;
      }
      case 'x-large': {
        cls = twMerge(cls, 'text-base px-8 py-3 rounded-lg');
        break;
      }
      default: {
        return '';
      }
    }

    return cls;
  }, [size, type]);

  return (
    <button
      className={twMerge(
        twClass,
        clsx({
          'rounded-full': rounded,
          'pointer-events-none opacity-50 select-none': disabled || loading,
        }),
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      type={htmlType}
      title={title}
      style={style}
    >
      {loading && (
        <svg
          className={clsx('animate-spin h-4 w-4', {
            'text-white': type === 'solid',
            'text-primary': type !== 'solid',
          })}
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
