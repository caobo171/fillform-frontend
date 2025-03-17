import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

type AlertProps = {
  title?: string | React.ReactNode;
  content?: string | React.ReactNode;
  type?: 'info' | 'error' | 'warning' | 'success';
  className?: string;
  titleClass?: string;
  contentClass?: string;
};

export function Alert(props: AlertProps) {
  const { title, content, type, className, titleClass, contentClass } = props;

  const wrapperClass = useMemo(() => {
    if (type === 'info') {
      return 'bg-blue-50';
    }

    if (type === 'error') {
      return 'bg-red-50';
    }

    if (type === 'warning') {
      return 'bg-yellow-50';
    }

    if (type === 'success') {
      return 'bg-green-50';
    }

    return 'bg-gray-50';
  }, [type]);

  const iconClass = useMemo(() => {
    if (type === 'info') {
      return 'text-blue-400';
    }

    if (type === 'error') {
      return 'text-red-400';
    }

    if (type === 'warning') {
      return 'text-yellow-400';
    }

    if (type === 'success') {
      return 'text-green-400';
    }

    return 'text-gray-400';
  }, [type]);

  const textClass = useMemo(() => {
    if (type === 'info') {
      return 'text-blue-700';
    }

    if (type === 'error') {
      return 'text-red-700';
    }

    if (type === 'warning') {
      return 'text-yellow-700';
    }

    if (type === 'success') {
      return 'text-green-700';
    }

    return 'text-gray-700';
  }, [type]);

  const icon = useMemo(() => {
    if (type === 'info') {
      return (
        <InformationCircleIcon
          className={twMerge('h-5 w-5', iconClass)}
          aria-hidden="true"
        />
      );
    }

    if (type === 'error') {
      return (
        <XCircleIcon
          className={twMerge('h-5 w-5', iconClass)}
          aria-hidden="true"
        />
      );
    }

    if (type === 'warning') {
      return (
        <ExclamationTriangleIcon
          className={twMerge('h-5 w-5', iconClass)}
          aria-hidden="true"
        />
      );
    }

    if (type === 'success') {
      return (
        <CheckCircleIcon
          className={twMerge('h-5 w-5', iconClass)}
          aria-hidden="true"
        />
      );
    }

    return '';
  }, [type, iconClass]);

  return (
    <div className={twMerge('rounded-md p-4', wrapperClass, className)}>
      <div className="flex">
        <div className="flex-shrink-0">{icon}</div>
        <div className="ml-3">
          <h3 className={twMerge('text-sm font-medium', textClass, titleClass)}>
            {title}
          </h3>

          {content && (
            <div className={twMerge('mt-2 text-sm', textClass, contentClass)}>
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
