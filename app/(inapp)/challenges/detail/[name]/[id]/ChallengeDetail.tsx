'use client';

import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React, { useCallback } from 'react';

import {
  useChallengeDetail,
  useChallengeUserDetail,
  useUserListExpand,
} from '@/app/(inapp)/challenges/challengeHook';
import { General } from '@/app/(inapp)/challenges/detail/[name]/[id]/_components/General';
import { Performance } from '@/app/(inapp)/challenges/detail/[name]/[id]/_components/Performance';
import { PodcastList } from '@/app/(inapp)/challenges/detail/[name]/[id]/_components/PodcastList';
import { UserList } from '@/app/(inapp)/challenges/detail/[name]/[id]/_components/UserList';
import { MeHook } from '@/store/me/hooks';
import { PageProps } from '@/store/types';

export function ChallengeDetail({ params: { id } }: PageProps) {
  const {
    data,
    isLoading,
    mutate: reloadChallengeDetail,
  } = useChallengeDetail(id);

  const { users } = useUserListExpand(data);

  const me = MeHook.useMe();

  const { data: userDetail, mutate: reloadUserDetail } = useChallengeUserDetail(
    id,
    me?.id
  );

  const reloadData = useCallback(() => {
    reloadChallengeDetail();

    reloadUserDetail();
  }, [reloadChallengeDetail, reloadUserDetail]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex-auto">
          <div className="h-[24px] w-[150px] rounded bg-gray-200 animate-pulse" />

          <div className="mt-2 rounded h-[20px] w-[300px] bg-gray-200 animate-pulse" />
        </div>

        <div className="w-full h-[300px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="w-full h-[120px] rounded-lg bg-gray-200 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900 flex items-center justify-between">
          Thông tin thử thách
          <Link
            aria-hidden="true"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
            href="/challenges"
          >
            <ArrowLongLeftIcon className="w-auto h-6" />
            Tất cả thử thách
          </Link>
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Chi tiết về thử thách bao gồm tất cả các thành tích và hoạt động của
          người tham gia
        </p>
      </div>

      <General
        challenge={data}
        userDetail={userDetail}
        reloadData={reloadData}
      />

      <Performance users={users} />

      <PodcastList challenge={data} userDetail={userDetail} />

      <UserList challenge={data} />
    </div>
  );
}
