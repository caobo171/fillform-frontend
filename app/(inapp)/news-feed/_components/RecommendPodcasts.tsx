import { PlayIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { PodcastAction } from '@/app/(inapp)/home/_components/PodcastAction';
import Constants from '@/core/Constants';
import { useRecommendPodcasts } from '@/hooks/podcast';
import { useSourceByID } from '@/hooks/source';
import { Helper } from '@/services/Helper';
import { RawPodcast } from '@/store/types';

type PodcastItemProps = {
  className?: string;
  style?: React.CSSProperties;
  podcast: RawPodcast;
};

export function PodcastItem({ podcast, style, className }: PodcastItemProps) {
  const source = useSourceByID(podcast.source_key);

  const href = useMemo(
    () => `/podcasts/detail/${Helper.generateCode(podcast.name)}/${podcast.id}`,
    [podcast.id, podcast.name]
  );

  return (
    <div
      style={style}
      className={twMerge(
        'relative w-full flex gap-3 items-center rounded-lg transition-all outline-none',
        className
      )}
    >
      <PodcastAction data={podcast} />

      <Link
        href={href}
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`,
        }}
        className="relative bg-center flex-shrink-0 bg-cover bg-no-repeat rounded-lg w-[72px] h-[72px] ring-1 ring-gray-50"
      />

      <div className={clsx('w-full flex flex-col h-[72px] justify-between')}>
        <Link
          href={href}
          className="flex flex-col gap-1 text-gray-900 hover:text-black"
        >
          <p className="text-xs">ESL {podcast.sub_name}</p>

          <p className="text-sm font-medium line-clamp-1" title={podcast.name}>
            {podcast.name}
          </p>
        </Link>

        <div className="flex gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <PlayIcon className="w-4 h-4" />

            {Helper.formatNumber(podcast.views ? podcast.views : 0)}
          </div>

          <Link
            href={`/podcasts?source_keys=${podcast.source_key}`}
            className="flex items-center gap-1.5 hover:text-gray-900 line-clamp-1"
          >
            <Square3Stack3DIcon className="w-4 h-4" />
            <span className="line-clamp-1">{source.name}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RecommendPodcasts() {
  const { data, isLoading } = useRecommendPodcasts();

  if (isLoading) {
    return <div className="rounded-lg w-[292px] h-[498px] animate-pulse" />;
  }

  return (
    data && (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="font-medium text-base mb-4">Recommend for you</h3>

        <div className="flex flex-col gap-5">
          {data.podcasts.map((podcast) => (
            <PodcastItem key={podcast.id} podcast={podcast} />
          ))}
        </div>
      </div>
    )
  );
}
