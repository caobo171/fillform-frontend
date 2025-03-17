import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { PauseIcon, PlayIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import { useCallback, useContext } from 'react';
import { twMerge } from 'tailwind-merge';

import { QueueContext } from '@/contexts';
import { PlayerContext } from '@/contexts/PlayerContext';
import { QueueAction } from '@/contexts/QueueContext';
import Constants from '@/core/Constants';
import DateUtil from '@/services/Date';
import { RawPodcast } from '@/store/types';

export function PodcastItem({ data }: { data: RawPodcast }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: data.id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    cursor: 'unset',
  };

  const { queue, setQueue } = useContext(QueueContext);

  const { togglePlay, playing } = useContext(PlayerContext);

  const isCurrentPodcast = queue.playing?.id === data?.id;

  const handlePlay = useCallback(() => {
    if (isCurrentPodcast) {
      togglePlay(false);
    } else {
      setQueue({ type: QueueAction.UpdatePlaying, playing: data });
    }
  }, [data, isCurrentPodcast, setQueue, togglePlay]);

  const handleRemove = useCallback(() => {
    setQueue({ type: QueueAction.RemovePodcasts, podcasts: [data] });
  }, [data, setQueue]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group flex gap-3 items-center w-full px-4 py-2"
    >
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

      <p className="flex-1 flex flex-col gap-1 select-none">
        <span className="text-gray-500 text-xs">ESL {data?.sub_name}</span>

        <span title={data?.name} className="text-sm text-gray-900 line-clamp-1">
          {data?.name}
        </span>
      </p>

      <span
        className={clsx('text-xs text-gray-500 select-none', {
          'group-hover:hidden': !isCurrentPodcast,
        })}
      >
        {DateUtil.displayTime(data?.duration ?? 0)}
      </span>

      <XMarkIcon
        onMouseDown={handleRemove}
        title="Xóa khỏi danh sách chờ"
        className={clsx(
          'hidden w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-900',
          {
            'group-hover:block': !isCurrentPodcast,
          }
        )}
      />
    </div>
  );
}
