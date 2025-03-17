'use client';

import { PlayIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Constants, { PostCastSubmitType } from '@/core/Constants';
import { useSourceByID } from '@/hooks/source';
import { Helper } from '@/services/Helper';
import { RawPodcast } from '@/store/types';

interface PodcastItemProps {
  className?: string;
  style?: React.CSSProperties;
  podcast: RawPodcast;
}

export function PodcastItem({ podcast, style, className }: PodcastItemProps) {
  const source = useSourceByID(podcast.source_key);

  return (
    <Link
      style={style}
      className={twMerge(
        'w-full flex gap-4 items-center px-2 py-2 hover:bg-gray-50 rounded-lg transition-all cursor-pointer outline-none',
        className
      )}
      href={`/podcasts/detail/${Helper.generateCode(podcast.name)}/${podcast.id}`}
    >
      <div
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`,
        }}
        className="bg-center flex-shrink-0 bg-cover bg-no-repeat rounded-lg w-[96px] h-[96px] ring-1 ring-gray-50"
      />

      <div className="w-full flex flex-col h-[96px] justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold">ESL {podcast.sub_name}</p>

          <p className="text-sm text-gray-900 line-clamp-1">{podcast.name}</p>
        </div>

        <div className="flex gap-6 text-xs text-gray-700">
          <div className="flex items-center gap-1.5">
            <PlayIcon className="w-4 h-4" />

            {podcast.views ? podcast.views : 0}
          </div>

          <div className="flex items-center gap-1.5">
            <Square3Stack3DIcon className="w-4 h-4" />
            {source.name}
          </div>
        </div>

        {podcast.podcast_submit && (
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
    </Link>
  );
}
