import { orderBy } from 'lodash';
import { useMemo } from 'react';
import useSWR from 'swr';

import { ClassApi } from '@/app/admin/classes/classApi';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawFeedback, RawUserStats } from '@/store/types';

export function useFeedbacks(classId: string, studentId: string) {
  const { data, isLoading, mutate, error } = useSWR(
    [ClassApi.GetFeedback, { class_id: classId, receiver_id: studentId }],
    Fetch.getFetcher.bind(Fetch)
  );

  const dataJson: RawFeedback[] = useMemo(() => {
    const res = data?.data as AnyObject;

    if (!Array.isArray(res?.feedbacks)) {
      return [];
    }

    const list = res.feedbacks.map((item: AnyObject) => ({
      id: item?.id,
      receiver_id: item?.receiver_id,
      receiver_name: item?.receiver_name,
      receiver_gmail: item?.receiver_gmail,
      reviewer_id: item?.reviewer_id,
      reviewer_name: item?.reviewer_name,
      reviewer_gmail: item?.reviewer_gmail,
      content: item?.content,
      object_id: item?.object_id,
      object_type: item?.object_type,
      create_at: item?.create_at,
      update_at: item?.update_at,
    }));

    return orderBy(list, ['create_at'], ['desc']);
  }, [data]);

  return {
    data: dataJson,
    isLoading,
    mutate,
    error,
  };
}

export function useStudentDetail(classId: string, studentId: string) {
  const { data, isLoading, error, mutate } = useSWR(
    [ClassApi.StudentDetail, { id: classId, user_id: studentId }],
    Fetch.getFetcher.bind(Fetch)
  );

  const userStats: RawUserStats = useMemo(() => {
    const res = data?.data as AnyObject;

    return {
      user: res?.user,
      record: res?.record,
      podcast_submits: res?.podcast_submits,
      current_order: res?.current_order,
      num_done_submits: res?.podcast_submits?.length,
      num_in_progress: 0
    };
  }, [data]);

  return {
    data: userStats,
    isLoading,
    mutate,
    error,
  };
}

export function useAssignmentDetail(id: string) {
  const { data, isLoading, error, mutate, isValidating } = useSWR(
    [ClassApi.AssignmentDetail, { id }],
    Fetch.getFetcher.bind(Fetch)
  );

  const result = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return {
      assignment: rawData?.assignment,
      class: rawData?.class,
    };
  }, [data]);

  return {
    data: result,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}
