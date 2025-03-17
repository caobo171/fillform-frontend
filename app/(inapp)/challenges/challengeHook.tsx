'use client';

import { orderBy, sumBy } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';

import { ChallengeApi } from '@/app/(inapp)/challenges/challengeApi';
import {
  RawChallenge,
  UserChallenge,
  UserResult,
} from '@/app/(inapp)/challenges/challengeType';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

export function useChallenges(params?: AnyObject) {
  const { data, mutate, isLoading } = useSWR(
    [ChallengeApi.List, params],
    Fetch.getFetcher.bind(Fetch)
  );

  const dataJson: RawChallenge[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    if (!Array.isArray(rawData?.challenges)) {
      return [];
    }

    return rawData?.challenges;
  }, [data]);

  return {
    data: dataJson,
    mutate,
    isLoading,
  };
}

export function useChallengeDetail(id: string) {
  const { data, mutate, isLoading } = useSWR(
    [
      ChallengeApi.Detail,
      { id, is_get_full_podcasts: true, is_get_full_members: true },
    ],
    Fetch.getFetcher.bind(Fetch)
  );

  const dataJson: RawChallenge = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return rawData?.challenge;
  }, [data]);

  return {
    data: dataJson,
    mutate,
    isLoading,
  };
}

export function useChallengeDetailWithPaginationMembers(
  id: number,
  page: number,
  pageSize: number = 20
) {
  const { data, mutate, isLoading } = useSWR(
    [ChallengeApi.GetMembers, { id, page, page_size: pageSize }],
    Fetch.getFetcher.bind(Fetch)
  );

  const dataJson: RawChallenge = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return rawData?.challenge;
  }, [data]);

  return {
    data: dataJson,
    mutate,
    isLoading,
  };
}

export function useChallengeUserDetail(
  id?: string | number,
  userId?: string | number
) {
  const { data, mutate, isLoading, isValidating } = useSWR(
    id
      ? [ChallengeApi.UserDetail, { challenge_id: id, user_record_id: userId }]
      : null,
    Fetch.getFetcher.bind(Fetch)
  );

  const result: RawChallenge = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return rawData?.challenge;
  }, [data]);

  return {
    data: result,
    mutate,
    isLoading,
    isValidating,
  };
}

export function useUserListExpand(challenge: RawChallenge) {
  const [users, setUsers] = useState<UserChallenge[]>([]);

  const [loading, setLoading] = useState<boolean>(false);

  const getUsers = useCallback(async () => {
    if (!Array.isArray(challenge?.members) || !challenge?.members?.length) {
      return;
    }

    setLoading(true);

    const usersResult = await Fetch.getFetcher([
      ChallengeApi.UserResults,
      { challenge_id: challenge.id },
    ]);

    const members: UserChallenge[] = [];

    challenge.members.forEach((member) => {
      let totalPoint = 0;
      let numberOfFinishedPodcast = 0;
      let listeningTime = 0;
      let uniqueCorrectWords = 0;

      // go through all the podcasts in challenge to sum the point
      // and check it is finished or not

      const result: UserResult | undefined = (
        (usersResult.data as AnyObject)?.results as UserResult[]
      )?.find((item) => item.id === member.id);

      const podcastsData = result?.podcasts_data ?? [];

      podcastsData.forEach((p) => {
        // each podcast contains a list of users that have listened to the podcast

        const podcastPoint =
          challenge.podcasts_data.find((po) => po.podcast_id === p.podcast_id)
            ?.point ?? 0;

        const userPoint = p?.user_point ?? 0;

        totalPoint += userPoint;

        numberOfFinishedPodcast += userPoint >= podcastPoint * 0.5 ? 1 : 0;

        listeningTime += p.listening_time;

        uniqueCorrectWords += p.unique_correct_words;
      });

      // calculate the average accuracy
      const submittedPodcast = podcastsData.filter(
        (item) => item.user_accuracy
      );

      const averageAccuracy =
        sumBy(submittedPodcast, 'user_accuracy') / submittedPodcast.length || 0;

      const listenedTime = sumBy(podcastsData, 'user_listen_time') || 0;

      members.push({
        ...member,
        ...result,
        totalPoint,
        numberOfFinishedPodcast,
        averageAccuracy,
        listenedTime,
        joinedChallengeAt: (result?.joined_at ?? 0) * 1000,
        listeningTime,
        uniqueCorrectWords,
      });
    });

    const sortedUsers = orderBy(members, ['totalPoint'], ['desc']);

    setUsers(sortedUsers);

    setLoading(false);
  }, [challenge]);

  useEffect(() => {
    getUsers().then();
  }, [getUsers]);

  return { users, loading };
}
