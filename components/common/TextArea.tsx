import clsx from 'clsx';
import React, { ChangeEventHandler, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type TextAreaProps = {
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  ref?: React.RefCallback<HTMLTextAreaElement>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement>;
  children?: string;
  defaultValue?: string;
};

// only disable this rule for forwardRef
// eslint-disable-next-line react/display-name
export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (props, ref) => {
    const { className, disabled, children, ...rest } = props;

    return (
      <textarea
        ref={ref}
        rows={5}
        disabled={disabled}
        className={twMerge(
          // using text-base on mobile to avoid auto zoom
          'block w-full outline-none rounded-md border-0 py-1.5 px-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-inset focus:ring-gray-700 text-base sm:text-sm',
          clsx({
            'pointer-events-none': disabled,
          }),
          className
        )}
        {...rest}
      >
        {children}
      </textarea>
    );
  }
);
