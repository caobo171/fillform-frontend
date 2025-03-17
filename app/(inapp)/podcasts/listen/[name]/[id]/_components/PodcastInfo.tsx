'use client';

import Link from 'next/link';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';

export function PodcastInfo() {
  const { podcast } = usePlayerContext();

  return (
    <div className="flex md:hidden gap-3 items-center">
      <Link
        href={Podcast.getURL(podcast)}
        title={podcast?.name}
        className="flex-shrink-0 w-[56px] h-[56px] rounded bg-center bg-cover"
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL}${podcast?.image_url})`,
        }}
      />

      <p className="flex flex-col gap-1">
        <span className="text-xs text-gray-500">ESL {podcast?.sub_name}</span>

        <Link
          href={Podcast.getURL(podcast)}
          title={podcast?.name}
          className="text-sm text-gray-900 line-clamp-1 hover:text-black"
        >
          {podcast?.name}
        </Link>
      </p>
    </div>
  );
}
