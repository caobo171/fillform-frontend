import { ExclamationTriangleIcon } from '@heroicons/react/20/solid';
import React from 'react';

type WarningWithAccentBorderProps = {
  className?: string;
  children: React.ReactNode;
  color?: string;
};

export function WarningWithAccentBorder(props: WarningWithAccentBorderProps) {
  const { children, className, color = 'yellow' } = props;

  return (
    <div className={className}>
      <div className={`border-l-4 border-${color}-400 bg-${color}-50 p-4`}>
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon
              className={`h-5 w-5 text-${color}-400`}
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <p className={`text-sm text-${color}-700`}>{children}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
