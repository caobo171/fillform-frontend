import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { RawChallenge } from '@/store/types';

export type ChallengeItemProps = {
  data: RawChallenge;
  className?: string;
};

export function TimeStatus({ data, className }: ChallengeItemProps) {
  const timeStatus = useMemo(() => {
    const startTime = (data.start_time ?? 0) * 1000;

    const endTime = (data.end_time ?? 0) * 1000;

    const currentTime = new Date().getTime();

    if (endTime > currentTime && startTime < currentTime) {
      return <span className="text-sm text-green-500">Ongoing</span>;
    }

    if (endTime < currentTime) {
      return <span className="text-sm text-red-500">Finished</span>;
    }

    if (startTime > currentTime) {
      return <span className="text-sm text-blue-500">Coming soon</span>;
    }

    return null;
  }, [data]);

  return (
    <p className={twMerge('flex gap-2 items-center', className)}>
      {timeStatus}
    </p>
  );
}
