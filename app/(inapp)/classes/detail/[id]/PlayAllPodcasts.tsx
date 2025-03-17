import { PlayIcon } from '@heroicons/react/24/solid';
import { flatMap, union } from 'lodash';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { Button } from '@/components/common';
import { QueueContext } from '@/contexts';
import { QueueAction } from '@/contexts/QueueContext';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawAssignment } from '@/store/types';

type PlayAllPodcastsProps = {
  assignments: RawAssignment[];
};

export function PlayAllPodcasts({ assignments }: PlayAllPodcastsProps) {
  const { setQueue } = useContext(QueueContext);

  const [ids, setIds] = useState<number[]>([]);

  const { data: podcastsData } = useSWR(
    ['/api/podcasts/ids', { ids: ids.join(',') }],
    Fetch.getFetcher.bind(Fetch)
  );

  const podcastList = useMemo(
    () => (podcastsData as AnyObject)?.data?.podcasts ?? [],
    [podcastsData]
  );

  useEffect(() => {
    const podcasts = flatMap(assignments, (obj: RawAssignment) => obj.podcasts);

    const podcastIds = podcasts.map((item) => item.podcast_id);

    const uniqueIds = union(podcastIds);

    setIds(uniqueIds);
  }, [assignments]);

  const handlePlayAll = useCallback(() => {
    setQueue({ type: QueueAction.UpdatePlaying, playing: podcastList[0] });

    setQueue({ type: QueueAction.UpdatePodcasts, podcasts: podcastList });
  }, [podcastList, setQueue]);

  if (!podcastList?.length) {
    return null;
  }

  return (
    <Button type="outline" rounded onClick={handlePlayAll}>
      <PlayIcon className="w-5 h-5 text-primary" /> Nghe tất cả podcasts
    </Button>
  );
}
