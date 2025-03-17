import {
  CheckBadgeIcon,
  ClockIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  FireIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import Link from 'next/link';
import React from 'react';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

import { TimeFilter } from '@/hooks/RecordAnalyze/constants';
import { useRecordAnalyze } from '@/hooks/RecordAnalyze/useRecordAnalyze';
import { useUserStreak } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawUserStats } from '@/store/types';

type UserPointProps = {
  data?: RawUserStats;
  className?: string;
};

export function OverallStats(props: UserPointProps) {
  const { className, data } = props;

  const { averageAccuracy, listenedTime, points } = useRecordAnalyze(
    data?.record,
    TimeFilter.All
  );

  const { data: currentStreak } = useUserStreak(data?.user.id);

  const { data: maxStreak } = useSWR(
    [`/api/user/max.streak`, { user_id: data?.user.id }],
    Fetch.getFetcher.bind(Fetch)
  );

  const maxStreakNumber =
    (maxStreak as AnyObject)?.data?.max_streak_number ?? 0;

  const meData = MeHook.useMe();

  return (
    <div className={twMerge('flex flex-col gap-6', className)}>
      <div className="flex gap-6 flex-wrap md:flex-nowrap">
        {/* Left column */}
        <div className="rounded-lg bg-white flex gap-6 p-6 md:w-2/3 w-full">
          <div className="flex flex-col justify-between">
            <span className="text-sm font-medium text-gray-900">
              WELE SCORES
            </span>
            <div className="flex flex-col gap-2">
              <span className="text-6xl font-semibold text-primary">
                {Helper.formatNumber(data?.billboard?.score ?? points)}
              </span>
            </div>

            <p className="text-sm text-gray-900">
              Xếp hạng{' '}
              <span className="text-primary">
                {Helper.formatNumber(data?.current_order)}
              </span>
              &nbsp;trên tổng số{' '}
              {data?.billboard_count
                ? Helper.formatNumber(data?.billboard_count)
                : 'tất cả'}{' '}
              học viên của WELE
            </p>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 md:w-1/3 w-full">
          <div className="flex gap-6 p-4 rounded-lg bg-white text-blue-500">
            <div className="w-14 h-14 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClockIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {Helper.hhmmss(listenedTime)}
              </span>
              <span className="text-sm">Thời gian nghe</span>
            </div>
          </div>

          <div className="flex gap-6 p-4 rounded-lg bg-white text-purple-500">
            <div className="w-14 h-14 rounded-lg bg-purple-50 flex items-center justify-center">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {Helper.formatNumber(averageAccuracy)}%
              </span>
              <span className="text-sm">Độ chính xác</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="gap-4 md:flex hidden">
        <div
          className="flex items-start gap-2 rounded-lg bg-white py-3 px-4"
          style={{ width: 'calc(25% - 12px)' }}
        >
          <FireIcon
            className={twMerge(
              'w-5 h-5 mt-1.5',
              currentStreak ? 'text-orange-500' : 'text-gray-500'
            )}
          />

          <div className="flex flex-col flex-1">
            <div className="flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900">
                {currentStreak}
              </span>

              <span
                title="Kỉ lục"
                className="flex items-center justify-center gap-[2px] rounded-full py-[2px] px-2 text-xs text-red-500 bg-red-50 font-semibold"
              >
                {maxStreakNumber}
                <FireIconSolid className="text-red-500 w-3 h-3" />
              </span>
            </div>

            <span className="text-sm text-gray-500">Ngày liên tiếp</span>
          </div>
        </div>

        <div
          className="flex items-start gap-2 rounded-lg bg-white py-3 px-4"
          style={{ width: 'calc(25% - 12px)' }}
        >
          <DocumentTextIcon className="w-5 h-5 mt-1.5 text-indigo-500" />

          <div className="flex flex-col">
            <span className="text-lg font-medium text-gray-900">
              {Helper.formatNumber(data?.listened_words)}
            </span>
            <span className="text-sm text-gray-500">Từ đã nghe</span>
          </div>
        </div>

        <Link
          href={
            meData?.id === data?.user?.id
              ? '/podcasts?scope=listened&page=1'
              : '?#'
          }
          className="flex items-start gap-2 rounded-lg bg-white py-3 px-4"
          style={{ width: 'calc(25% - 12px)' }}
        >
          <DocumentCheckIcon className="w-5 h-5 mt-1.5 text-green-500" />

          <div className="flex flex-col">
            <span className="text-lg font-medium text-gray-900">
              {data?.num_done_submits}
            </span>
            <span className="text-sm text-gray-500">Bài đã nộp</span>
          </div>
        </Link>

        <Link
          href={
            meData?.id === data?.user?.id
              ? '/podcasts?scope=listening&page=1'
              : '?#'
          }
          className="flex items-start gap-2 rounded-lg bg-white py-3 px-4"
          style={{ width: 'calc(25% - 12px)' }}
        >
          <PlayIcon className="w-5 h-5 mt-1.5 text-red-500" />

          <div className="flex flex-col">
            <span className="text-lg font-medium text-gray-900">
              {data?.num_in_progress !== undefined
                ? data?.num_in_progress
                : Number(data?.num_submits) - Number(data?.num_done_submits)}
            </span>
            <span className="text-sm text-gray-500">Bài đang nghe</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
