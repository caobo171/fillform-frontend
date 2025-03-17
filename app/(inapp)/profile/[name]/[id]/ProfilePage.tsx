'use client';

import { useAsync } from 'react-use';

import { Achievement } from '@/app/(inapp)/profile/[name]/[id]/_components/Achievement';
import { ListeningList } from '@/app/(inapp)/profile/[name]/[id]/_components/ListeningList';
import {
  ListeningListSkeleton,
  OverallSkeleton,
  PerformanceSkeleton,
  UserInfoSkeleton,
} from '@/app/(inapp)/profile/[name]/[id]/_components/LoadingSkeleton';
import { OverallStats } from '@/app/(inapp)/profile/[name]/[id]/_components/OverallStats';
import { Performance } from '@/app/(inapp)/profile/[name]/[id]/_components/Performance';
import { UserInfo } from '@/app/(inapp)/profile/[name]/[id]/_components/UserInfo';
import { useUserStats } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawPodcast } from '@/store/types';

type ProfilePageProps = {
  id: string;
};

export function ProfilePage(props: ProfilePageProps) {
  const { id } = props;

  const userDetail = useAsync(async () => {
    const res = await Fetch.postWithAccessToken<{ podcasts: RawPodcast[] }>(
      '/api/user/listened.podcasts',
      {
        id,
      }
    );

    return {
      podcasts: res.data.podcasts,
    };
  }, [id]);

  const { data: userStats, isLoading } = useUserStats(Number(id));

  if (userDetail.loading || isLoading) {
    return (
      <div className="py-10 flex gap-8">
        <div className="flex flex-col gap-8" style={{ width: '35%' }}>
          <UserInfoSkeleton />

          <ListeningListSkeleton />
        </div>

        <div className="flex flex-col gap-8" style={{ width: '65%' }}>
          <OverallSkeleton />

          <PerformanceSkeleton />
        </div>
      </div>
    );
  }

  if (!userStats || !userDetail?.value) {
    return null;
  }

  return (
    <div className="py-10 flex gap-8">
      <div className="flex flex-col gap-8" style={{ width: '35%' }}>
        <UserInfo data={userStats} />

        <ListeningList podcasts={userDetail?.value?.podcasts ?? []} />
      </div>

      <div className="flex flex-col gap-8" style={{ width: '65%' }}>
        <OverallStats data={userStats} />

        <Achievement badges={userStats?.badges ?? []} />

        <Performance data={userStats} />
      </div>
    </div>
  );
}
