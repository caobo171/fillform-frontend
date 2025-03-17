'use client';

import {
  BookOpenIcon,
  HeartIcon,
  PlusCircleIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { useContext, useState } from 'react';

import { PlaylistModal } from '@/app/(inapp)/playlist/_components/PlaylistModal';
import { Player } from '@/app/_components/Queue/Player';
import { QueueContext } from '@/contexts';
import { QueueAction } from '@/contexts/QueueContext';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';

export function PlayerPanel() {
  const { queue, setQueue } = useContext(QueueContext);

  const [openAddToPlaylistModal, setOpenAddToPlaylistModal] =
    useState<boolean>(false);

  const toggleShowList = () => {
    setQueue({ type: QueueAction.ShowList, showList: !queue.showList });
  };

  const { playing } = queue;

  return (
    <div className="w-full px-4 py-3 bottom-0 right-0 z-50 fixed shadow-top shadow-gray-200 bg-gray-100 flex items-center justify-between">
      <PlaylistModal
        podcast={queue?.playing}
        open={openAddToPlaylistModal}
        onCancel={() => setOpenAddToPlaylistModal(false)}
      />

      <div className="flex gap-3 items-center w-[368px]">
        <Link
          href={playing ? Podcast.getURL(playing) : '#'}
          title={playing?.name}
          className="flex-shrink-0 w-[56px] h-[56px] rounded bg-center bg-cover"
          style={{
            backgroundImage: `url(${Constants.IMAGE_URL}${playing?.image_url})`,
          }}
        />

        <p className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">ESL {playing?.sub_name}</span>
          <Link
            href={playing ? Podcast.getURL(playing) : '#'}
            title={playing?.name}
            className="text-sm text-gray-900 line-clamp-1"
          >
            {playing?.name}
          </Link>
        </p>
      </div>

      <Player />

      <div className="flex gap-4 items-center justify-end w-[368px]">
        <Link href={playing ? Podcast.getURL(playing) : '#'}>
          <BookOpenIcon
            title="Đi đến trang nghe chép"
            className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
          />
        </Link>

        <HeartIcon
          title="Thêm vào danh sách yêu thích"
          className="w-5 h-5 text-gray-500 hover:text-primary cursor-pointer"
        />

        <PlusCircleIcon
          title="Thêm vào playlist"
          className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
          onClick={() => setOpenAddToPlaylistModal(true)}
        />

        <QueueListIcon
          title="Danh sách chờ"
          className={clsx(
            'w-5 h-5 cursor-pointer',
            queue?.showList
              ? 'text-primary'
              : 'text-gray-500 hover:text-gray-900'
          )}
          onClick={toggleShowList}
        />
      </div>
    </div>
  );
}
