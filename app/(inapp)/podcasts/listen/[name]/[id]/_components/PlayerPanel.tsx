'use client';

import { PlusCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';

import { PodcastPlayer } from './Player';

export function PlayerPanel() {
  const { podcast } = usePlayerContext();

  return (
    <div className="w-full px-4 py-3 bottom-0 right-0 z-50 fixed shadow-top shadow-gray-200 bg-gray-100 flex items-center gap-6 justify-center md:justify-between">
      <div className="hidden md:flex gap-3 items-center w-[368px]">
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

      <PodcastPlayer />

      <div className="hidden md:flex gap-4 items-center justify-end w-[368px]">
        <PlusCircleIcon
          title="Thêm vào playlist"
          className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
        />
      </div>
    </div>
  );
}
