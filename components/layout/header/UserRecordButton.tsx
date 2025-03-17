import { ChartBarSquareIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';

import { useHighLight } from '@/hooks/useHighLight';

export function UserRecordButton() {
  const { isClicked, setAsClicked } = useHighLight('user-record');

  return (
    <Link
      href="/user/record"
      className="relative text-gray-900 w-10 h-10 rounded-full bg-gray-150 flex justify-center items-center hover:bg-gray-200"
      title="Phân tích thành tựu"
      onClick={setAsClicked}
    >
      <ChartBarSquareIcon className="h-5 w-5" />

      {!isClicked && (
        <span className="absolute z-1 top-0 right-0 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
        </span>
      )}
    </Link>
  );
}
