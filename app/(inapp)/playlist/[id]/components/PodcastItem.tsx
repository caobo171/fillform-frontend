import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  BarsArrowUpIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { useCallback, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { PlaylistModal } from '@/app/(inapp)/playlist/_components/PlaylistModal';
import { QueueContext } from '@/contexts';
import { PlayerContext } from '@/contexts/PlayerContext';
import { QueueAction } from '@/contexts/QueueContext';
import Constants, { PodcastSource } from '@/core/Constants';
import { RawPodcast, RawUserPlaylist } from '@/store/types';

type PodcastProps = {
  data: RawPodcast;
  playlist: RawUserPlaylist;
  onRemove: (id: number) => void;
  allowToEdit?: boolean;
};

export function PodcastItem({
  data,
  playlist,
  onRemove,
  allowToEdit,
}: PodcastProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data.id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const [selected, setSelected] = useState<RawPodcast>();

  const { queue, setQueue } = useContext(QueueContext);

  const { togglePlay, playing } = useContext(PlayerContext);

  const isCurrentPodcast = queue.playing?.id === data?.id;

  const handlePlay = useCallback(() => {
    if (isCurrentPodcast) {
      togglePlay(false);
    } else {
      setQueue({ type: QueueAction.UpdatePlaying, playing: data });

      // if user playing podcast from playlist, set queue list to current playlist
      setQueue({
        type: QueueAction.UpdatePodcasts,
        podcasts: playlist?.podcasts,
      });
    }
  }, [data, isCurrentPodcast, playlist?.podcasts, setQueue, togglePlay]);

  const handleAddToQueue = useCallback(() => {
    const isAlreadyInQueue =
      queue.podcasts.findIndex((item) => item.id === data.id) >= 0;

    if (isAlreadyInQueue) {
      toast.info('Đã có sẵn trong danh sách chờ');
    } else {
      setQueue({ type: QueueAction.AddPodcasts, podcasts: [data] });

      // there is no queue podcasts yet
      if (!queue.podcasts?.length) {
        setQueue({ type: QueueAction.UpdatePlaying, playing: data });
      } else {
        toast.success('Đã thêm vào danh dách chờ');
      }
    }
  }, [data, queue.podcasts, setQueue]);

  return (
    <>
      <PlaylistModal
        open={!!selected}
        onCancel={() => setSelected(undefined)}
        podcast={selected}
      />

      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className="group flex items-center justify-between gap-10 bg-white py-2 pl-2 pr-3 text-sm text-gray-900"
      >
        <div className="flex-1 flex items-center gap-2">
          <div className="relative">
            <div
              className="w-[32px] h-[32px] rounded bg-center bg-cover"
              style={{
                backgroundImage: `url(${Constants.IMAGE_URL}${data?.image_url})`,
              }}
            />

            <div
              aria-hidden="true"
              className={twMerge(
                'absolute w-6 h-6 rounded-full z-1 top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]',
                'hidden group-hover:flex bg-primary items-center justify-center cursor-pointer',
                clsx({
                  flex: isCurrentPodcast,
                })
              )}
              onMouseDown={handlePlay}
            >
              {isCurrentPodcast && playing ? (
                <PauseIcon className="w-4 h-4 text-white" />
              ) : (
                <PlayIcon className="w-4 h-4 text-white" />
              )}
            </div>
          </div>

          <span className="line-clamp-1">
            ESL {data?.sub_name} - {data?.name}
          </span>
        </div>

        <p className="w-[200px] line-clamp-1">{data?.narrator}</p>

        <p className="w-[200px] line-clamp-1">
          {
            PodcastSource.find((item) => item.source_key === data?.source_key)
              ?.source_name
          }
        </p>

        {/* <p className="w-[40px] line-clamp-1">3:30</p> */}

        <div className="w-[100px] flex items-center justify-end gap-2">
          <BarsArrowUpIcon
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
            title="Thêm vào danh danh sách chờ"
            onMouseDown={handleAddToQueue}
          />

          <PlusCircleIcon
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
            title="Thêm vào playlist"
            onMouseDown={() => setSelected(data)}
          />

          {allowToEdit && (
            <MinusCircleIcon
              className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
              title="Xóa khỏi danh sách hiện tại"
              onMouseDown={() => onRemove(data?.id)}
            />
          )}
        </div>
      </div>
    </>
  );
}
