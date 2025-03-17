import React, { useRef } from 'react';
import useSWRMutation from 'swr/mutation';

import { AutoComplete } from '@/components/common';
import Constants from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast } from '@/store/types';

type PodcastSearchBoxProps = {
  onSelect: (value: number) => void;
};

export function PodcastSearchBox(props: PodcastSearchBoxProps) {
  const { onSelect } = props;

  const podcastListRef = useRef<RawPodcast[]>([]);

  const { trigger: searchPodcasts } = useSWRMutation(
    '/api/podcasts/search',
    Fetch.postFetcher.bind(Fetch)
  );

  const getPodcasts = async (searchString: string) => {
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
  };

  return (
    <AutoComplete
      onFetch={getPodcasts}
      onSelect={(value) => onSelect(Number(value))}
      className="w-1/2"
      inputWrapperClassName="rounded-lg"
      inputClassName="py-2.5 rounded-lg"
      placeholder="Tìm kiếm podcast và chọn để thêm vào playlist"
    />
  );
}
