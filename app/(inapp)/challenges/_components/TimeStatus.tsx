import { ClockIcon } from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Status, Type } from '@/app/(inapp)/challenges/challengeConstant';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';

export type TimeStatusProps = {
  data: RawChallenge;
  className?: string;
};

const getTimeLeft = (endTime: number, currentTime: number) => {
  const millisecondsLeft = endTime - currentTime;

  const oneDayInMilliseconds = 86400000;

  const oneHourInMilliseconds = 3600000;

  const oneMinuteInMilliseconds = 60000;

  if (millisecondsLeft > oneDayInMilliseconds) {
    return `${Math.floor((endTime - currentTime) / oneDayInMilliseconds)} ngày`;
  }

  if (millisecondsLeft > oneHourInMilliseconds) {
    return `${Math.floor((endTime - currentTime) / oneHourInMilliseconds)} giờ`;
  }

  if (millisecondsLeft > oneMinuteInMilliseconds) {
    return `${Math.floor((endTime - currentTime) / oneMinuteInMilliseconds)} phút`;
  }

  return 0;
};

export function TimeStatus({ data, className }: TimeStatusProps) {
  const timeStatus = useMemo(() => {
    const isJoined = data?.expired_time_by_user;

    const isLimitTime = data?.type === Type.TimeLimit;

    const timeLimit = data?.data?.time_limit || 0;

    const startTime = (data?.data?.start_time || 0) * 1000;

    const endTime =
      (data.expired_time_by_user || data?.data?.end_time || 0) * 1000;

    const currentTime = new Date().getTime();

    const timeLeft = getTimeLeft(endTime, currentTime);

    if (data.metatype === Status.Finished) {
      return (
        <>
          <ClockIcon className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Đã kết thúc</span>
        </>
      );
    }

    if (startTime > currentTime) {
      return (
        <>
          <ClockIcon className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-blue-500">Sắp diễn ra</span>
        </>
      );
    }

    // has limit time but have not joined yet
    // show the number of days
    if (isLimitTime && !isJoined) {
      return (
        <>
          <ClockIcon className="w-5 h-5 text-gray-900" />
          <span className="text-sm text-gray-900">
            {Math.floor(timeLimit / 86400)} ngày
          </span>
        </>
      );
    }

    if (endTime > currentTime && startTime < currentTime) {
      return (
        <>
          <ClockIcon className="w-5 h-5 text-green-500" />
          <span className="text-sm text-green-500">Còn {timeLeft}</span>
        </>
      );
    }

    if (endTime < currentTime) {
      return (
        <>
          <ClockIcon className="w-5 h-5 text-red-500" />
          <span className="text-sm text-red-500">Đã kết thúc</span>
        </>
      );
    }

    return null;
  }, [data]);

  return (
    <p className={twMerge('flex gap-2 items-center', className)}>
      {timeStatus}
    </p>
  );
}
