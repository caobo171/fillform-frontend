'use client';

import { ShareIcon } from '@heroicons/react/24/outline';
import { FacebookShareButton } from 'react-share';

import { AddToPlaylistButton } from '@/components/playlist/AddToPlayListButton';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';
import { RawPodcast } from '@/store/types';

export function DisplayHeader({ podcast }: { podcast: RawPodcast }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-start items-center gap-2">
        <span className="text-sm text-gray-600 font-semibold rounded-full py-1.5 px-3 bg-white ring-1 ring-gray-100">
          ESL {podcast.sub_name}
        </span>

        <FacebookShareButton
          title="Chia sẻ"
          url={Constants.DOMAIN + Podcast.getURL(podcast)}
          className="outline-none text-gray-600 w-8 h-8 rounded-full bg-white flex items-center justify-center ring-1 ring-gray-100"
          style={{ background: 'white' }}
        >
          <ShareIcon className="w-4 h-4" />
        </FacebookShareButton>

        <AddToPlaylistButton
          podcast={podcast}
          className="outline-none text-gray-600 w-8 h-8 rounded-full bg-white flex items-center justify-center ring-1 ring-gray-100 cursor-pointer"
        />
      </div>

      <h3 className="text-2xl font-semibold text-gray-900">{podcast.name}</h3>
    </div>
  );
}
