import { useMemo } from 'react';
import useSWR from 'swr';

import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { ChallengeApi } from '@/app/admin/challenges/challengeApi';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast, RawUser } from '@/store/types';

export function useChallenges(page?: number, pageSize?: number) {
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    [ChallengeApi.List, { page, page_size: pageSize }],
    Fetch.getFetcher.bind(Fetch)
  );

  const result: RawChallenge[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    const activeList = rawData?.challenge_actives ?? [];

    const list = rawData?.challenges ?? [];

    return list.map((item: RawChallenge) => {
      const active = !!activeList.find((c: RawChallenge) => c.id === item.id);

      return { ...item, active };
    });
  }, [data]);

  return {
    data: result,
    isLoading,
    error,
    mutate,
    isValidating,
  };
}

export function useChallengeDetail(id?: number) {
  const { data, mutate, isLoading, isValidating } = useSWR(
    id
      ? [
          ChallengeApi.Detail,
          { id, is_get_full_podcasts: true, is_get_full_members: true },
        ]
      : null,
    Fetch.getFetcher.bind(Fetch)
  );

  const dataJson: RawChallenge & {
    podcasts: RawPodcast[];
    members: RawUser[];
  } = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return {
      ...(rawData?.challenge ?? {}),
      podcasts: Array.isArray(rawData?.challenge?.podcasts)
        ? rawData.challenge.podcasts
        : [],
      members: Array.isArray(rawData?.challenge?.members)
        ? rawData.challenge.members
        : [],
    };
  }, [data]);

  return {
    data: dataJson,
    mutate,
    isLoading,
    isValidating,
  };
}

export function usePodcastWithIds(ids?: number[]) {
  const { data, isLoading } = useSWR(
    ids && !!ids.length
      ? [ChallengeApi.ListPodcastWithIds, { ids: ids.join(',') }]
      : null,
    Fetch.getFetcher.bind(Fetch)
  );

  const result: RawPodcast[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return rawData?.podcasts ?? [];
  }, [data]);

  return {
    data: result,
    isLoading,
  };
}
