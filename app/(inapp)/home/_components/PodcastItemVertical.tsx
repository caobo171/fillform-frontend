'use client';

import Link from 'next/link';
import React, { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { PodcastAction } from '@/app/(inapp)/home/_components/PodcastAction';
import Constants from '@/core/Constants';
import { useSourceByID } from '@/hooks/source';
import { Helper } from '@/services/Helper';
import { RawPodcast } from '@/store/types';

interface PodcastItemProps {
  className?: string;
  style?: React.CSSProperties;
  podcast: RawPodcast;
}

export function PodcastItemVertical({
  podcast,
  style,
  className,
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
        'group relative w-[182px] flex flex-col gap-2 rounded-lg transition-all outline-none',
        className
      )}
    >
      <PodcastAction data={podcast} className="top-full -translate-y-full" />

      <Link
        href={href}
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`,
        }}
        className="bg-center flex-shrink-0 bg-cover bg-no-repeat rounded-lg h-[182px] ring-1 ring-gray-50"
      />

      <div className="w-full flex flex-col gap-1">
        <Link
          href={href}
          className="text-base text-gray-900 line-clamp-2 hover:text-black"
          title={`${podcast.sub_name} - ${podcast.name}`}
        >
          ESL {podcast.sub_name} - {podcast.name}
        </Link>

        <Link
          href={`/podcasts?source_keys=${podcast.source_key}`}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {source.name}
        </Link>
      </div>
    </div>
  );
}
