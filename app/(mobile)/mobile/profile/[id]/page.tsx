'use client';
import { Metadata } from 'next';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawPodcast, RawPodcastSubmit, RawUserActionLog } from '@/store/types';
import { PlayerContextProvider } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { ContentContextProvider } from '@/app/(inapp)/podcasts/_components/ContentContext';
import { PodcastEditor } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastEditor';
import { PodcastActions } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastActions';
import { useUserStats } from '@/hooks/user';
import { ListeningListSkeleton, OverallSkeleton, PerformanceSkeleton, UserInfoSkeleton } from '@/app/(inapp)/profile/[name]/[id]/_components/LoadingSkeleton';
import { UserInfo } from '@/app/(inapp)/profile/[name]/[id]/_components/UserInfo';
import { ListeningList } from '@/app/(inapp)/profile/[name]/[id]/_components/ListeningList';
import { OverallStats } from '@/app/(inapp)/profile/[name]/[id]/_components/OverallStats';
import { Achievement } from '@/app/(inapp)/profile/[name]/[id]/_components/Achievement';
import { Performance } from '@/app/(inapp)/profile/[name]/[id]/_components/Performance';

export default function Page({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}) {

    const { data: userStats, isLoading } = useUserStats(Number(params.id));

    if (isLoading) {
        return (
            <div className="py-10 flex gap-8 bg-gray-50">
                <div className="flex flex-col gap-8">
                    <OverallSkeleton />

                    <PerformanceSkeleton />
                </div>

            </div>
        );
    }

    if (!userStats) {
        return null;
    }

    return (
        <div className="flex gap-8 bg-gray-50">
            <div className="flex flex-col gap-8">
                <OverallStats data={userStats} />


                <Performance data={userStats} />
            </div>
        </div>
    );
}
