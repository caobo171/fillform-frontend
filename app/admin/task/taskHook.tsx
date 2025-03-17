import { useMemo } from 'react';
import useSWR from 'swr';

import { TaskApi } from '@/app/admin/task/taskApi';
import { RawSocialShare } from '@/app/admin/task/taskType';
import { useUsers } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPagination } from '@/store/types';

export function useTasks(page?: number, pageSize?: number, status?: string) {
  const { data, isLoading, isValidating, error, mutate } = useSWR(
    [
      TaskApi.List,
      {
        page_size: pageSize ?? 10,
        page,
        status: status ? [status] : undefined,
      },
    ],
    Fetch.getFetcher.bind(Fetch)
  );

  const userIds: number[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    if (!Array.isArray(rawData?.list)) {
      return [];
    }

    return rawData.list.map((item: AnyObject) => item.user_id);
  }, [data]);

  const { data: users } = useUsers(userIds);

  const result: { list: RawSocialShare[]; pagination: RawPagination } =
    useMemo(() => {
      const rawData = data?.data as AnyObject;

      if (!Array.isArray(rawData?.list)) {
        return { list: [], pagination: { page: 1, total: 0, page_size: 10 } };
      }

      const list = rawData.list.map((item: AnyObject) => {
        const userData = users?.find((user) => user.id === item.user_id);

        return {
          id: item.id,
          public_link: item?.data_object?.public_link,
          reaction_total: item.reaction_total,
          reward_coin: item.reward_coin,
          create_at: item.create_at,
          update_at: item.update_at,
          image_url: item.image_url,
          user_id: item.user_id,
          status: item.status,
          user: userData,
        };
      });

      return {
        list,
        pagination: {
          page: rawData?.pagination?.page,
          total: rawData?.pagination?.total,
          page_size: rawData?.pagination,
        },
      };
    }, [users, data]);

  return {
    data: result,
    isLoading,
    isValidating,
    error,
    mutate,
  };
}
