import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { AxiosResponse } from 'axios';
import clsx from 'clsx';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { Loading } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';
import { RawPodcast, RawUserPlaylist } from '@/store/types';

import { PodcastItem } from './PodcastItem';

type PodcastListProps = {
  playlist: RawUserPlaylist;
  data: RawPodcast[];
  allowToEdit?: boolean;
  reloadData?: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function PodcastList({
  data,
  playlist,
  reloadData,
  allowToEdit,
}: PodcastListProps) {
  const { trigger: updateOrder } = useSWRMutation(
    PlaylistAPI.Update,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: remove } = useSWRMutation(
    PlaylistAPI.RemovePodcast,
    Fetch.postFetcher.bind(Fetch)
  );

  const [loading, setLoading] = useState<boolean>(false);

  const [podcasts, setPodcasts] = useState<RawPodcast[]>(data);

  useEffect(() => {
    setPodcasts(data);
  }, [data]);

  const handleRemove = async (id: number) => {
    setLoading(true);

    try {
      const result: AnyObject = await remove({
        payload: { id: playlist?.id, podcast_id: id },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        if (reloadData) {
          // to update playlist detail data
          await reloadData();
        }

        toast.success(`Đã xóa khỏi ${playlist?.name}`);

        // to update global playlists data
        MeFunctions.loadProfile();
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }

    setLoading(false);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over?.id) {
      return;
    }

    const prevData = [...podcasts];

    const oldIndex = prevData.findIndex((podcast) => podcast.id === active.id);

    const newIndex = prevData.findIndex((podcast) => podcast.id === over.id);

    const newList = arrayMove(prevData, oldIndex, newIndex);

    setPodcasts(newList);

    const ids = newList.map((item) => item.id);

    updateOrder({
      payload: { id: playlist.id, name: playlist.name, podcast_ids: ids },
    });
  };

  if (!allowToEdit) {
    return (
      <div
        className={clsx(
          'relative flex flex-col rounded-lg overflow-hidden divide-gray-100 divide-y',
          { 'ring-1 ring-gray-100': podcasts?.length }
        )}
      >
        {loading && (
          <div className="flex items-center justify-center absolute top-0 left-0 z-1 bg-white bg-opacity-50 w-full h-full">
            <Loading className="text-primary h-6 w-6" />
          </div>
        )}
        {podcasts.map((item) => (
          <PodcastItem
            key={item.id}
            data={item}
            playlist={playlist}
            onRemove={() => {}}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'relative flex flex-col rounded-lg overflow-hidden divide-gray-100 divide-y',
        { 'ring-1 ring-gray-100': podcasts?.length }
      )}
    >
      {loading && (
        <div className="flex items-center justify-center absolute top-0 left-0 z-1 bg-white bg-opacity-50 w-full h-full">
          <Loading className="text-primary h-6 w-6" />
        </div>
      )}
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext
          items={podcasts}
          strategy={verticalListSortingStrategy}
        >
          {podcasts.map((item) => (
            <PodcastItem
              key={item.id}
              data={item}
              playlist={playlist}
              onRemove={handleRemove}
              allowToEdit
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
