import { EllipsisVerticalIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { PlaylistModal } from '@/app/(inapp)/playlist/_components/PlaylistModal';
import { Dropdown } from '@/components/common';
import { RawPodcast } from '@/store/types';

type PodcastActionProps = {
  data?: RawPodcast;
  className?: string;
};

export function PodcastAction(props: PodcastActionProps) {
  const { className, data } = props;

  const [openPlaylistModal, setOpenPlaylistModal] = useState<boolean>(false);

  const options = useMemo(
    () => [
      {
        label: (
          <span className="flex items-center gap-2">
            <PlusIcon className="w-4 h-5 text-gray-700" /> Thêm vào playlist
          </span>
        ),
        value: 'add_to_play_list',
        onClick: () => setOpenPlaylistModal(true),
      },
    ],
    []
  );

  return (
    <>
      <PlaylistModal
        open={openPlaylistModal}
        onCancel={() => setOpenPlaylistModal(false)}
        podcast={data}
      />

      <Dropdown
        options={options}
        className={twMerge(
          'absolute z-1 right-0 top-0 leading-[0px]',
          className
        )}
        popupClassName="left-0"
      >
        <span className="block rounded-full hover:bg-gray-100">
          <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 bg-transparent hover:text-gray-900" />
        </span>
      </Dropdown>
    </>
  );
}
