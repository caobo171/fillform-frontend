import dayjs from 'dayjs';
import { useMemo } from 'react';

import { useUserListExpand } from '@/app/(inapp)/challenges/challengeHook';
import { useChallengeDetail } from '@/app/admin/challenges/challengeHook';

export function useExport(id?: number) {
  const { data, isLoading, isValidating } = useChallengeDetail(id);

  const { users, loading } = useUserListExpand(data);

  const csvData = useMemo(() => {
    if (!users || !users[0]) {
      return [];
    }

    const headers = [
      'Username',
      'Full Name',
      'Email',
      'Address',
      'City',
      'DOB',
      'Description',
      'Gender',
      'Joined Wele',
      'Joined Challenge',
      'Submissions',
      'Listening Time',
      'Unique Correct Words',
      'Average Accuracy',
      'Total Points',
    ];

    // the order of value in array should be the same with headers definition
    const studentData = users.map((item) => [
      item.username,
      item.fullname,
      item.email,
      item.address,
      item.city,
      item.dob ? dayjs(item.dob * 1000).format('DD/MM/YYYY') : item.dob,
      item.description,
      item.sex,
      item.since ? dayjs(item.since * 1000).format('DD/MM/YYYY') : item.since,
      dayjs(item.joinedChallengeAt).format('DD/MM/YYYY'),
      item.numberOfFinishedPodcast,
      item.listeningTime,
      item.uniqueCorrectWords,
      item.averageAccuracy,
      item.totalPoint,
    ]);

    return [headers, ...studentData];
  }, [users]);

  return { loading: isLoading || isValidating || loading, csvData };
}
