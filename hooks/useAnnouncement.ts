import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import { RawSystemAnnoucement } from '@/store/types';
import Fetch from '@/lib/core/fetch/Fetch';
import { useMe } from './user';

export function useAnnouncement() {
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<RawSystemAnnoucement | undefined>(undefined);
  const me = useMe();

  const { data, mutate } = useSWR<{ announcement?: RawSystemAnnoucement }>(
    me.data ? '/api/system.announcement/user.get' : null,
    async (url: string) => {
      const response = await Fetch.get(url);
      return response.data as { announcement?: RawSystemAnnoucement };
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (data?.announcement && me.data) {
      setCurrentAnnouncement(data.announcement);
      setShowAnnouncement(true);
    }
  }, [data, me.data]);

  const closeAnnouncement = useCallback(() => {
    setShowAnnouncement(false);
    setCurrentAnnouncement(undefined);
  }, []);

  const previewAnnouncement = useCallback((announcement: RawSystemAnnoucement) => {
    setCurrentAnnouncement(announcement);
    setShowAnnouncement(true);
  }, []);

  return {
    showAnnouncement,
    currentAnnouncement,
    closeAnnouncement,
    previewAnnouncement,
  };
}
