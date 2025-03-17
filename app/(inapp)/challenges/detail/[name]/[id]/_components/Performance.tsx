import {
  CheckBadgeIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { sumBy } from 'lodash';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { UserChallenge } from '@/app/(inapp)/challenges/challengeType';
import { Helper } from '@/services/Helper';

type PerformanceProps = {
  users: UserChallenge[];
  className?: string;
  titleClassName?: string;
  boxWrapperClassName?: string;
  boxClassName?: string;
};

export function Performance(props: PerformanceProps) {
  const {
    users,
    className,
    titleClassName,
    boxWrapperClassName,
    boxClassName,
  } = props;

  const numberOfFinishedPodcasts = sumBy(users, 'numberOfFinishedPodcast');

  // calculate the average accuracy
  const listOfUserStartedChallenge = users.filter(
    (item) => item.averageAccuracy
  );

  const averageAccuracy =
    sumBy(listOfUserStartedChallenge, 'averageAccuracy') /
      listOfUserStartedChallenge.length || 0;

  const totalPoint = sumBy(users, 'totalPoint');

  const totalListenedTime = sumBy(users, 'listeningTime');

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <h3 className={twMerge('text-sm font-semibold', titleClassName)}>
        Kết quả tổng quan
      </h3>

      <div className={twMerge('flex gap-8', boxWrapperClassName)}>
        <div
          className={twMerge(
            'w-1/4 flex gap-6 p-4 rounded-lg bg-emerald-100 text-emerald-600',
            boxClassName
          )}
        >
          <div className="w-14 h-14 rounded-lg bg-emerald-200 flex items-center justify-center">
            <DocumentCheckIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {numberOfFinishedPodcasts}
            </span>
            <span className="text-sm">Bài đã hoàn thành</span>
          </div>
        </div>

        <div
          className={twMerge(
            'w-1/4 flex gap-6 p-4 rounded-lg bg-orange-100 text-orange-600',
            boxClassName
          )}
        >
          <div className="w-14 h-14 rounded-lg bg-orange-200 flex items-center justify-center">
            <ClockIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {Helper.getTimeListen(totalListenedTime, true)}
            </span>
            <span className="text-sm">Thời gian nghe</span>
          </div>
        </div>

        <div
          className={twMerge(
            'w-1/4 flex gap-6 p-4 rounded-lg bg-blue-100 text-blue-600',
            boxClassName
          )}
        >
          <div className="w-14 h-14 rounded-lg bg-blue-200 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {Helper.formatNumber(totalPoint)}
            </span>
            <span className="text-sm">Tổng điểm</span>
          </div>
        </div>

        <div
          className={twMerge(
            'w-1/4 flex gap-6 p-4 rounded-lg bg-purple-100 text-purple-600',
            boxClassName
          )}
        >
          <div className="w-14 h-14 rounded-lg bg-purple-200 flex items-center justify-center">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {Helper.formatNumber(averageAccuracy * 100)}%
            </span>
            <span className="text-sm">Độ chính xác</span>
          </div>
        </div>
      </div>
    </div>
  );
}
