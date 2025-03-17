'use client';

import { PlayIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { PodcastAction } from '@/app/(inapp)/home/_components/PodcastAction';
import Constants, { PostCastSubmitType } from '@/core/Constants';
import { useSourceByID } from '@/hooks/source';
import { Helper } from '@/services/Helper';
import { RawPodcast } from '@/store/types';

interface PodcastItemProps {
  className?: string;
  style?: React.CSSProperties;
  podcast: RawPodcast;
  ranking?: number;
  showProgress?: boolean;
}

export function PodcastItemHorizontal({
  podcast,
  style,
  className,
  ranking,
  showProgress,
}: PodcastItemProps) {
  const source = useSourceByID(podcast.source_key);

  const href = useMemo(
    () => `/podcasts/detail/${Helper.generateCode(podcast.name)}/${podcast.id}`,
    [podcast.id, podcast.name]
  );

  return (
    <div
      style={style}
      className={twMerge(
        'relative w-full flex gap-4 items-center rounded-lg transition-all outline-none',
        className
      )}
    >
      <PodcastAction data={podcast} />

      <Link
        href={href}
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`,
        }}
        className="relative bg-center flex-shrink-0 bg-cover bg-no-repeat rounded-lg w-[96px] h-[96px] ring-1 ring-gray-50"
      >
        {ranking && (
          <span className="absolute z-1 bottom-0 left-0 w-6 h-6 rounded-tr-lg bg-white text-xs font-bold text-gray-900 flex items-center justify-center">
            {ranking}
          </span>
        )}
      </Link>

      <div
        className={clsx('w-full flex flex-col h-[96px] justify-between', {
          'py-1': !showProgress,
        })}
      >
        <Link
          href={href}
          className="flex flex-col gap-1 text-gray-900 hover:text-black"
        >
          <p className="text-xs font-bold">ESL {podcast.sub_name}</p>

          <p
            className={twMerge(
              'text-sm',
              showProgress ? 'line-clamp-1' : 'line-clamp-2'
            )}
            title={podcast.name}
          >
            {podcast.name}
          </p>
        </Link>

        <div className="flex gap-6 text-xs text-gray-700">
          <div className="flex items-center gap-1.5">
            <PlayIcon className="w-4 h-4" />

            {Helper.formatNumber(podcast.views ? podcast.views : 0)}
          </div>

          <Link
            href={`/podcasts?source_keys=${podcast.source_key}`}
            className="flex items-center gap-1.5 hover:text-gray-900"
          >
            <Square3Stack3DIcon className="w-4 h-4" />
            {source.name}
          </Link>
        </div>

        {showProgress && podcast.podcast_submit && (
          <div className="relative">
            <div
              title={`${(podcast.podcast_submit.current_result.percent * 100).toFixed(2)}%`}
              className={clsx(
                `overflow-hidden h-2 text-xs flex rounded-full`,
                podcast.podcast_submit.status === PostCastSubmitType.SUBMITTED
                  ? 'bg-red-500'
                  : 'bg-gray-200'
              )}
            >
              <div
                style={{
                  width: `${podcast.podcast_submit.current_result.percent * 100}%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
