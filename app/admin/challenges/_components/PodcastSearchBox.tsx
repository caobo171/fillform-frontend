import React, { useCallback, useRef } from 'react';
import useSWRMutation from 'swr/mutation';

import { AutoComplete } from '@/components/common';
import Constants from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast } from '@/store/types';

type PodcastSearchBoxProps = {
  onSelect: (value: number, podcast?: RawPodcast) => void;
};

export function PodcastSearchBox(props: PodcastSearchBoxProps) {
  const { onSelect } = props;

  const podcastListRef = useRef<RawPodcast[]>([]);

  const { trigger: searchPodcasts } = useSWRMutation(
    '/api/podcasts/search',
    Fetch.postFetcher.bind(Fetch)
  );

  const getPodcasts = useCallback(
    async (searchString: string) => {
      const result: AnyObject = await searchPodcasts({
        payload: { q: searchString },
      });

      if (!result?.data?.podcasts) {
        return Promise.resolve([]);
      }

      // save the last search result
      podcastListRef.current = result.data.podcasts;

      const podcastList = result.data.podcasts.map((pod: RawPodcast) => ({
        value: pod.id,
        label: (
          <div className="flex gap-2 items-center">
            <div
              className="w-6 h-6 rounded bg-cover bg-center"
              style={{
                backgroundImage: `url(${Constants.IMAGE_URL}${pod.image_url})`,
              }}
            />
            <span className="flex-1">{pod.name}</span>
          </div>
        ),
      }));

      return Promise.resolve(podcastList);
    },
    [searchPodcasts]
  );

  const handleSelect = useCallback(
    (val: number) => {
      const podcast = podcastListRef.current.find((item) => item.id === val);

      onSelect(val, podcast);
    },
    [onSelect]
  );

  return (
    <AutoComplete
      onFetch={getPodcasts}
      onSelect={(value) => handleSelect(Number(value))}
      className="w-1/2"
      inputClassName="py-1.5"
      popupClassName="bottom-full mb-1"
      placeholder="Search podcast and select to add"
    />
  );
}
