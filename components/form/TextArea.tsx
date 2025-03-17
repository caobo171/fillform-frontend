import React from 'react';
import clsx from 'clsx';

type TextAreaProps = {
  className?: string;
  disabled?: boolean;
};

export function TextArea(props: TextAreaProps) {
  const { className, disabled, ...rest } = props;

  return (
    <textarea
      rows={5}
      disabled={disabled}
      className={clsx(
        'outline-none resize-y rounded border border-solid border-gray-400 py-[5px] px-[11px]',
        'focus:border-gray-900 focus:shadow-sm',
        {
          '!border-gray-100 bg-gray-100 focus:border-gray-100': disabled,
        },
        className
      )}
      {...rest}
    />
  );
}
