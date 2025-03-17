import { useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { useUsers } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawUser, RawUserPlaylist } from '@/store/types';

export function usePlaylists() {
  const { data, error, mutate, isLoading } = useSWR(
    [PlaylistAPI.List, null],
    Fetch.getFetcher.bind(Fetch)
  );

  const parsedData: RawUserPlaylist[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    if (Array.isArray(rawData?.playlists)) {
      return rawData.playlists;
    }

    return [];
  }, [data]);

  return {
    error,
    isLoading,
    mutate,
    data: parsedData,
  };
}

export function usePublicPlaylists() {
  const { data, error, mutate, isLoading } = useSWR(
    [PlaylistAPI.ListPublic, { page: 1, page_size: 12 }],
    Fetch.getFetcher.bind(Fetch)
  );

  const [playlists, setPlaylists] = useState<RawUserPlaylist[]>([]);

  const [userIds, setUserIds] = useState<number[]>([]);

  const { data: usersData } = useUsers(userIds);

  useEffect(() => {
    const rawData = data?.data as AnyObject;

    if (Array.isArray(rawData?.playlists)) {
      const validList: RawUserPlaylist[] = rawData.playlists.filter(
        (item) => item.podcasts?.length
      );

      const ids: number[] = [];

      validList.forEach((item) => {
        if (item.user_id && !ids.includes(item.user_id)) {
          ids.push(item.user_id);
        }
      });

      setUserIds(ids);

      setPlaylists(validList);
    }
  }, [data]);

  useEffect(() => {
    if (Array.isArray(usersData)) {
      const newPlaylist = playlists.map((item) => {
        const author = usersData.find((u: RawUser) => u.id === item.user_id);

        return { ...item, user_name: author?.fullname ?? 'Unknown' };
      });

      setPlaylists(newPlaylist);
    }
  }, [usersData]);

  return {
    error,
    isLoading,
    mutate,
    data: playlists,
  };
}

export function usePlaylistDetail(id: string) {
  const { data, error, isLoading, mutate } = useSWR(
    [PlaylistAPI.Detail, { id }],
    Fetch.getFetcher.bind(Fetch)
  );

  const parsedData = useMemo(() => {
    const res = data?.data as AnyObject;

    return {
      id: res?.id ?? 0,
      name: res?.name ?? '',
      podcasts: Array.isArray(res?.podcasts) ? res.podcasts : [],
      since: res?.since ?? 0,
      user_id: res?.user_id ?? 0,
      last_update: res?.last_update ?? 0,
      description: res?.description ?? '',
      privacy: res?.privacy ?? 1,
    };
  }, [data]);

  return {
    data: parsedData,
    isLoading,
    error,
    mutate,
  };
}
