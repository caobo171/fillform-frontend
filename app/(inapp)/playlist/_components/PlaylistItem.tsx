import { PlayIcon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useContext } from 'react';
import { twMerge } from 'tailwind-merge';

import { getPlaylistThumb } from '@/app/(inapp)/playlist/playlistHelper';
import { QueueAction, QueueContext } from '@/contexts/QueueContext';
import { RawUserPlaylist } from '@/store/types';

type PlaylistItemProps = {
  data: RawUserPlaylist;
  isPublic?: boolean;
};

export function PlaylistItem({ data, isPublic }: PlaylistItemProps) {
  const { setQueue } = useContext(QueueContext);

  const startPlaying = () => {
    setQueue({ type: QueueAction.UpdatePlaying, playing: data.podcasts[0] });
    setQueue({ type: QueueAction.UpdatePodcasts, podcasts: data?.podcasts });
  };

  return (
    <div className="flex flex-col rounded-lg gap-2 w-[178px]">
      <div
        className="group w-[178px] h-[178px] bg-cover bg-center rounded-lg relative ring-1 ring-gray-100"
        style={{
          backgroundImage: `url(${getPlaylistThumb(data)})`,
        }}
      >
        <div
          className={twMerge(
            'opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0',
            'w-[48px] h-[48px] rounded-full bg-primary flex items-center justify-center shadow',
            'hover:bg-primary-900 absolute z-1 bottom-3 right-3 cursor-pointer ease-in-out duration-200'
          )}
          aria-hidden="true"
          onClick={startPlaying}
        >
          <PlayIcon className="w-6 h-6 text-white" />
        </div>
      </div>

      <div className="flex flex-col gap-0">
        <Link
          title={data.name}
          href={`/playlist/${data.id}`}
          className="text-base text-gray-900 hover:text-primary line-clamp-1"
        >
          {data.name}
        </Link>

        <p className="text-sm text-gray-500 flex items-center gap-2">
          <span>{data.podcasts.length} podcasts</span>
          {isPublic && (
            <>
              <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-gray-300" />

              <span className="flex-1 w-full truncate" title={data.user_name}>
                {data.user_name}
              </span>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
