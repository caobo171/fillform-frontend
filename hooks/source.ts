import useSWR from 'swr';

import { OtherSource } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawPodcastSource } from '@/store/types';

export const useSources = () => {
  const res = useSWR(
    '/api/podcast.source/list',
    async (url) => {
      const rest = await Fetch.postWithAccessToken<{
        podcast_sources: RawPodcastSource[];
      }>(url, {});

      const sorted = (
        (rest.data.podcast_sources as RawPodcastSource[]) || []
      ).sort((a, b) => a.position - b.position);

      // Add OtherSource to the end of the list
      return {
        sources: [...sorted, OtherSource],
      };
    },
    {}
  );

  return res;
};

export const useSourceByID = (id: number) => {
  const data = useSources();

  return data.data?.sources.find((source) => source.id == id) || OtherSource;
};
