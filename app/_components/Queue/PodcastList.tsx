import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { cloneDeep } from 'lodash';
import { useContext } from 'react';
import { twMerge } from 'tailwind-merge';

import { PodcastItem } from '@/app/_components/Queue/PodcastItem';
import { QueueContext } from '@/contexts';
import { QueueAction } from '@/contexts/QueueContext';

export function PodcastList() {
  const { queue, setQueue } = useContext(QueueContext);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over?.id) {
      return;
    }

    const prevData = cloneDeep(queue.podcasts);

    const oldIndex = prevData.findIndex((podcast) => podcast.id === active.id);

    const newIndex = prevData.findIndex((podcast) => podcast.id === over.id);

    const podcasts = arrayMove(prevData, oldIndex, newIndex);

    setQueue({ type: QueueAction.UpdatePodcasts, podcasts });
  };

  const closeList = () => {
    setQueue({ type: QueueAction.ShowList, showList: false });
  };

  return (
    <div
      className={twMerge(
        'fixed z-50 bg-white rounded-md shadow-lg ring-1 ring-black/5 right-4 bottom-[100px] h-[600px] w-[400px] text-sm text-gray-900',
        clsx('invisible opacity-0 ease-in-out duration-200 translate-y-2', {
          'visible opacity-100 translate-y-0': queue?.showList,
        })
      )}
    >
      <div className="p-4 flex items-center justify-between">
        <p className="select-none">Danh sách chờ</p>
        <XMarkIcon
          className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
          onClick={closeList}
        />
      </div>

      <div
        className="flex flex-col gap-2 overflow-y-auto overflow-x-hidden custom-scrollbar"
        style={{ maxHeight: 'calc(100% - 52px)' }} // - header height
      >
        <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext
            items={queue.podcasts}
            strategy={verticalListSortingStrategy}
          >
            {queue.podcasts.map((item) => (
              <PodcastItem key={item.id} data={item} />
            ))}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
