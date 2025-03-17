import clsx from 'clsx';

import { Input, InputProps } from '@/components/common';

type FormItemProps = {
  label: string;
  description?: string;
  message?: string;
} & InputProps;

export function FormInput(props: FormItemProps) {
  const { label, description, state, message, ...otherProps } = props;

  return (
    <div className="flex flex-col">
      <div className="text-sm mb-2 flex flex-col gap-1">
        <p className="text-gray-900">{label}</p>
        {description && <p className="text-gray-500">{description}</p>}
      </div>

      <Input size="x-large" state={state} {...otherProps} />

      {message && (
        <p
          className={clsx('text-sm mt-2', {
            'text-red-600': state === 'error',
            'text-green-600': state === 'success',
            'text-gray-900': state === 'normal',
          })}
        >
          {message}
        </p>
      )}
    </div>
  );
}
