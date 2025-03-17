import { FireIcon as FireIconOutline } from '@heroicons/react/24/outline';
import { FireIcon as FireIconSolid } from '@heroicons/react/24/solid';
import React, { useCallback, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useLocalStorage } from 'react-use';
import { twMerge } from 'tailwind-merge';

import { Popover } from '@/components/common';
import { useMeListeningTime } from '@/hooks/user';
import { RawUser } from '@/store/types';

type StreakProps = {
  data: RawUser;
};

export function Streak({ data }: StreakProps) {
  const { data: meData, mutate } = useMeListeningTime(data?.id);

  const streak = meData?.cache_streak?.streak_number ?? 0;

  const todayListenedTime = meData?.data?.listening_time ?? 0;

  const dayStreakTime = 10 * 60; // 10 minutes

  const isCompletedToday = todayListenedTime >= dayStreakTime;

  const [lastShowedNotify, setLastShowedNotify] = useLocalStorage(
    'lastShowedStreakNotify',
    0
  );

  const isShowedNotifyToday = useMemo(() => {
    const today = new Date();

    const lastShowedNotifyDate = new Date(lastShowedNotify ?? 0);

    return (
      lastShowedNotifyDate.getDate() === today.getDate() &&
      lastShowedNotifyDate.getMonth() === today.getMonth() &&
      lastShowedNotifyDate.getFullYear() === today.getFullYear()
    );
  }, [lastShowedNotify]);

  const progress = useMemo(() => {
    if (todayListenedTime >= dayStreakTime) {
      return '100%';
    }

    return `${(todayListenedTime / dayStreakTime) * 100}%`;
  }, [dayStreakTime, todayListenedTime]);

  useEffect(() => {
    if (isCompletedToday && !isShowedNotifyToday) {
      toast.info(
        <>
          <h4 className="text-base font-medium text-lime-600 mb-1">
            {streak} ngày liên tiếp
          </h4>
          <p>Chúc mừng bạn đã đạt được streak của ngày hôm nay!</p>
        </>,
        {
          autoClose: 60000, // auto close in 30 seconds
          icon: <FireIconSolid className="w-5 h-5 text-red-500" />,
        }
      );

      setLastShowedNotify(new Date().getTime());
    }
  }, [isCompletedToday, isShowedNotifyToday, setLastShowedNotify, streak]);

  const reloadMeListeningTime = useCallback(
    async (event: MessageEvent) => {
      // Receive the message from podcast listen page
      const requiredToReload = event.data === 'requireReloadMeListeningTime';

      // Only reload the data if the user has not completed the streak today
      if (requiredToReload && !isCompletedToday) {
        await mutate();
      }
    },
    [mutate, isCompletedToday]
  );

  useEffect(() => {
    if (!isCompletedToday) {
      // Listen to the message from podcast listen page
      // Only listen to the message if the user has not completed the streak today
      window.addEventListener('message', reloadMeListeningTime);
    }

    return () => {
      window.removeEventListener('message', reloadMeListeningTime);
    };
  }, [isCompletedToday, reloadMeListeningTime]);

  const button = useMemo(() => {
    const progressBlock = (
      <div className="absolute z-1 w-full h-full rounded-full top-0 left-0 overflow-hidden">
        <span
          className="absolute z-1 w-full bottom-0 left-0 bg-red-100"
          style={{ height: progress }}
        />
      </div>
    );

    if (streak) {
      return (
        <div
          className={twMerge(
            'w-[40px] h-[40px] bg-gray-150 hover:bg-gray-200',
            'flex items-center justify-center rounded-full',
            'relative'
          )}
        >
          {isCompletedToday ? (
            <FireIconSolid className="w-5 h-5 text-red-500 z-2" />
          ) : (
            <FireIconOutline className="w-5 h-5 text-red-500 z-2" />
          )}
          <span
            className={twMerge(
              'w-[14px] h-[14px] rounded-full bg-white text-red-500',
              'absolute bottom-0 right-0 z-1 text-[10px] leading-[10px]',
              'flex items-center justify-center z-2'
            )}
          >
            {streak}
          </span>
          {progressBlock}
        </div>
      );
    }

    return (
      <div
        className={twMerge(
          'w-[40px] h-[40px] bg-gray-150 hover:bg-gray-200',
          'flex items-center justify-center rounded-full',
          'relative'
        )}
      >
        <FireIconOutline className="w-5 h-5 text-gray-500 z-2" />
        <span
          className={twMerge(
            'w-[14px] h-[14px] rounded-full bg-white text-gray-500',
            'absolute bottom-0 right-0 z-1 text-[10px] leading-[10px]',
            'flex items-center justify-center z-2'
          )}
        >
          {streak}
        </span>
        {progressBlock}
      </div>
    );
  }, [isCompletedToday, progress, streak]);

  const content = useMemo(() => {
    if (streak > 5) {
      return (
        <span>
          Bạn đang rực cháy với <b className="text-red-500">{streak}</b> ngày
          học tập chăm chỉ liên tiếp. Tiếp tục duy trì thành tích bạn nhé!
        </span>
      );
    }

    if (streak > 0) {
      return (
        <span>
          Bạn đang có thành tích <b className="text-red-500">{streak}</b> ngày
          học tập chăm chỉ liên tiếp. Tiếp tục nâng cao thành tích bạn nhé!
        </span>
      );
    }

    return <span>Bắt đầu luyện tập để lưu danh sử sách bạn nhé!</span>;
  }, [streak]);

  return (
    <Popover
      button={button}
      popupClassName="left-1/2 -translate-x-1/2 mt-3 w-[350px]"
    >
      <div className="text-sm text-gray-900 py-2 px-2">{content}</div>
    </Popover>
  );
}
