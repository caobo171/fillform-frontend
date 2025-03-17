'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { PremiumWarning } from '@/app/(inapp)/_components/PremiumWarning';
import { PodcastList } from '@/app/(inapp)/playlist/[id]/components/PodcastList';
import { PodcastSearchBox } from '@/app/(inapp)/playlist/[id]/components/PodcastSearchBox';
import { Skeleton } from '@/app/(inapp)/playlist/[id]/components/Skeleton';
import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { usePlaylistDetail } from '@/app/(inapp)/playlist/playlistHooks';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import ACL from '@/services/ACL';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawPodcast, RawUserPlaylist } from '@/store/types';

import { Info } from './components/Info';

export function PlaylistDetail({ id }: { id: string }) {
  const { data, error, isLoading, mutate } = usePlaylistDetail(id);

  const sub = MeHook.useSubscription();

  const me = MeHook.useMe();

  const isPremiumUser = useMemo(() => Helper.isPremiumUser(sub), [sub]);

  const isAdmin = useMemo(() => ACL.isAdmin(me), [me]);

  const [podcasts, setPodcasts] = useState<RawPodcast[]>([]);

  const [playlist, setPlaylist] = useState<RawUserPlaylist>();

  const [adding, setAdding] = useState<boolean>(false);

  const allowToEdit = useMemo(
    () => me?.id === playlist?.user_id || isAdmin,
    [isAdmin, me?.id, playlist?.user_id]
  );

  const { trigger: add } = useSWRMutation(
    PlaylistAPI.AddPodcast,
    Fetch.postFetcher.bind(Fetch)
  );

  useEffect(() => {
    setPodcasts(data.podcasts);

    setPlaylist(data);
  }, [data]);

  const handleAdd = async (val: number) => {
    if (!val) {
      return;
    }

    const isAlreadyInPlaylist = !!playlist?.podcasts?.find(
      (item) => item.id === val
    );

    if (isAlreadyInPlaylist) {
      toast.info('Podcast đã có sẵn trong playlist');

      return;
    }

    setAdding(true);

    const result: AnyObject = await add({
      payload: { id: playlist?.id, podcast_id: val },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      await mutate();

      toast.success(`Đã thêm vào playlist`);
    }

    setAdding(false);
  };

  if (isLoading) {
    return <Skeleton />;
  }

  if (!playlist?.id || error) {
    return <span>Không tìm thấy nội dung phù hợp</span>;
  }

  if (!isPremiumUser) {
    return <PremiumWarning />;
  }

  return (
    <div className="flex-1 flex flex-col gap-[48px]">
      <Info data={playlist} reloadData={mutate} allowToEdit={allowToEdit} />

      <div className="flex flex-col gap-6">
        {allowToEdit && (
          <div className="flex items-center gap-4">
            <PodcastSearchBox onSelect={handleAdd} />

            {adding && <span>Đang thêm vào playlist...</span>}
          </div>
        )}

        <PodcastList
          playlist={playlist}
          data={podcasts}
          reloadData={mutate}
          allowToEdit={allowToEdit}
        />
      </div>
    </div>
  );
}
