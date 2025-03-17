'use client';

import clsx from 'clsx';
import { groupBy, orderBy, sumBy, union } from 'lodash';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

import { TopUser } from '@/app/(inapp)/billboard/_components/TopUser';
import { UserItem } from '@/app/(inapp)/billboard/_components/UserItem';
import { convertTotalScoreToRank } from '@/app/(inapp)/billboard/billboardHelper';
import { useBillboards } from '@/hooks/billboard';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawUser } from '@/store/types';

const FilterList = [
  { label: 'Tuần này', value: 'this-week' },
  { label: 'Tuần trước', value: 'last-week' },
  { label: 'Tháng này', value: 'this-month' },
  { label: 'Tháng trước', value: 'last-month' },
  { label: 'Tất cả', value: 'all' },
];

export function Billboard() {
  const searchParams = useSearchParams();

  const periodParam = searchParams.get('period') || 'this-week';

  const [period, setPeriod] = useState(periodParam);

  useEffect(() => {
    setPeriod(periodParam);
  }, [periodParam]);

  const me = MeHook.useMe();

  const { data, isLoading: loadingBillboard } = useBillboards(
    new URLSearchParams(`period=${period}`)
  );

  const [userIds, setUserIds] = useState<number[]>([]);

  const { data: rawUsersData, isLoading: loadingUserData } = useSWR(
    userIds.length
      ? ['/api/user/ids', { ids: union(userIds).join(',') }]
      : null,
    Fetch.getFetcher.bind(Fetch)
  );

  const usersData = useMemo(
    () => (rawUsersData as AnyObject)?.data?.users ?? [],
    [rawUsersData]
  );

  const users = useMemo(() => {
    if (!Array.isArray(data?.billboards)) {
      return [];
    }

    const groupedUsers = groupBy(data.billboards, 'user_id');

    const remapUsers = Object.values(groupedUsers).map((item) => {
      const totalScore = sumBy(item, 'score');

      return { ...item[0], score: totalScore };
    });

    const sortedUsers = orderBy(remapUsers, ['score'], 'desc');

    const ids = sortedUsers.map((item) => item.user_id);

    setUserIds(ids);

    return sortedUsers;
  }, [data?.billboards]);

  const usersDetail = useMemo(() => {
    if (!Array.isArray(usersData)) {
      return [];
    }

    return users.map((item, index) => {
      const user = usersData.find((u: RawUser) => u.id === item.user_id);

      return {
        user: {
          ...(user ?? {}),
          score: item.score,
        } as RawUser,
        rank: index + 1,
        journey: convertTotalScoreToRank(user?.score ?? 0),
      };
    });
  }, [users, usersData]);

  const LoadingSkeleton = useMemo(
    () => (
      <>
        <div className="flex items-end justify-center gap-6 text-sm mb-[56px]">
          <TopUser rank={2} isLoading />
          <TopUser rank={1} isLoading />
          <TopUser rank={3} isLoading />
        </div>

        <div className="flex flex-col gap-2 w-[600px] mr-auto ml-auto">
          {new Array(10).fill(0).map((item, index) => (
            <div
              key={index}
              className="h-[72px] rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </>
    ),
    []
  );

  const loggedInUserIndex = useMemo(
    () => usersDetail.findIndex((u) => u.user.id === me?.id),
    [me?.id, usersDetail]
  );

  const Content = useMemo(
    () => (
      <>
        <div className="flex items-end justify-center gap-6 text-sm mb-[56px]">
          <TopUser rank={2} data={usersDetail[1]?.user} />
          <TopUser rank={1} data={usersDetail[0]?.user} />
          <TopUser rank={3} data={usersDetail[2]?.user} />
        </div>

        <div className="w-full md:w-[600px] flex flex-col gap-2 mr-auto ml-auto">
          {usersDetail.map((item, index) => {
            // OK let breakdown the idea
            // we want to show about 10 first users
            // if there are less than 10 users, show all of them
            // if there are more than 10 users, show 3 first users at the top block, next top 7 users, ..., and 1 last user
            // we need to take care in case logged-in user in the middle of the list
            // show: top 10 users ... logged-in user ... last user

            // add ... before and after the logged-in user
            if (
              index === 10 ||
              (index === loggedInUserIndex + 1 &&
                index < usersDetail.length - 2)
            ) {
              return (
                <div
                  key={item.user.username}
                  className="flex items-center justify-center gap-2 py-4"
                >
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                </div>
              );
            }

            if (
              (index > 2 && index < 10) ||
              (index >= 10 &&
                (index === usersDetail.length - 1 ||
                  index === loggedInUserIndex))
            ) {
              return (
                <UserItem
                  key={item.user.username}
                  user={item.user}
                  rank={item.rank}
                  journey={item.journey}
                  highlight={index === loggedInUserIndex}
                />
              );
            }

            return null;
          })}
        </div>
      </>
    ),
    [loggedInUserIndex, usersDetail]
  );

  return (
    <div className="block md:flex flex-col items-center">
      <div className="overflow-x-auto mb-8" style={{ scrollbarWidth: 'none' }}>
        <div className="p-1 rounded-full flex flex-nowrap gap-1 text-xs md:bg-gray-100">
          {FilterList.map((item) => (
            <Link
              href={`?period=${item.value}`}
              key={item.value}
              className={twMerge(
                'px-4 py-2 rounded-full whitespace-nowrap bg-white md:bg-transparent cursor-pointer hover:bg-gray-200',
                clsx({
                  'bg-primary md:bg-primary text-white hover:bg-primary hover:text-white':
                    item.value === period,
                })
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>

      {loadingBillboard || loadingUserData ? LoadingSkeleton : Content}
    </div>
  );
}
