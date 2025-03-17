import { PlayIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useMemo } from 'react';

import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { Badge, Table, TableProps } from '@/components/common';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';
import { RawPodcast } from '@/store/types';

type PodcastListProps = {
  challenge: RawChallenge;
  userDetail?: RawChallenge;
};

type PodcastChallengeProps = RawPodcast & {
  podcastPoint: number;
  userPoint: number | string;
  averageAccuracy: number | string;
  isCompleted: boolean;
};

export function PodcastList({ challenge, userDetail }: PodcastListProps) {
  const tableData: PodcastChallengeProps[] = useMemo(() => {
    if (!Array.isArray(challenge?.podcasts)) {
      return [];
    }

    return challenge.podcasts.map((item) => {
      const userPodcast = userDetail?.podcasts_data?.find(
        (p) => p.podcast_id === item.id
      );

      const podcastData = challenge.podcasts_data.find(
        (p) => p.podcast_id === item.id
      );

      const userPoint = userPodcast?.user_point ?? 0;

      const userAccuracy = userPodcast?.user_accuracy || 0;

      const podcastPoint = podcastData?.point ?? 0;

      return {
        ...item,
        podcastPoint,
        isCompleted: userPoint >= podcastPoint * 0.5,
        userPoint: userPoint ? userPoint.toFixed(2) : '-',
        averageAccuracy: userAccuracy
          ? `${(userAccuracy * 100).toFixed(2)}%`
          : '-',
      };
    });
  }, [userDetail, challenge]);

  const columns: TableProps<PodcastChallengeProps>['columns'] = useMemo(
    () => [
      {
        title: 'Tên',
        key: 'image_url',
        className: 'min-w-[200px]',
        render: (podcast: RawPodcast) => (
          <div className="flex gap-2 items-center">
            <div
              className="w-8 h-8 ring-2 ring-gray-100 bg-cover bg-center rounded"
              style={{
                backgroundImage: `url(${Constants.IMAGE_URL}${podcast.image_url})`,
              }}
            />
            <span>
              ESL {podcast.sub_name} - {podcast.name}
            </span>
          </div>
        ),
      },
      {
        title: 'Điểm podcast',
        key: 'podcastPoint',
        dataIndex: 'podcastPoint',
      },
      {
        title: 'Điểm của bạn',
        key: 'userPoint',
        dataIndex: 'userPoint',
      },
      {
        title: 'Độ chính xác',
        key: 'averageAccuracy',
        dataIndex: 'averageAccuracy',
      },
      {
        title: 'Trạng thái',
        key: 'isCompleted',
        render: (podcast: PodcastChallengeProps) =>
          podcast.isCompleted ? (
            <Badge type="green">Hoàn thành</Badge>
          ) : (
            <Badge type="red">Chưa hoàn thành</Badge>
          ),
      },
      {
        title: 'Chi tiết',
        key: 'action',
        className: 'w-[88px] text-right',
        render: (podcast: RawPodcast) => (
          <div className="flex gap-3 w-full justify-center">
            <Link href={Podcast.getURL(podcast)}>
              <PlayIcon
                title="Nghe podcast"
                className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              />
            </Link>
          </div>
        ),
      },
    ],
    []
  );

  return (
    <div>
      {!!challenge?.podcasts?.length && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-sm text-gray-900">
            Podcast cần hoàn thành ({challenge.podcasts?.length})
          </h3>
          <Table columns={columns} data={tableData} />
        </div>
      )}
    </div>
  );
}
