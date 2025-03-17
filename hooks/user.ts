import Fetch from '@/lib/core/fetch/Fetch';
import { RawBadge, RawBillboard, RawPersonalRecord, RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '@/store/types';
import _ from 'lodash';
import useSWR, { useSWRConfig } from 'swr';
import { AnyObject } from '@/store/interface';
import { useCallback } from 'react';


export const useMe = () => {

	const res = useSWR('/api/me/profile', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			user: RawUser,
			weleclasses: RawWeleClass[],
			playlists: RawUserPlaylist[],
			sub: RawSubscription,
			code: number
		}>(url, {});

		return rest.data.user;

	}, {
	});

	return res;
}


export const useUsers = (ids: number[]) => {
	const res = useSWR('/api/user/ids?ids=' + _.union(ids).join(','), async (url) => {

		if (!ids) {
			return [];
		}

		const rest = await Fetch.postWithAccessToken<{
			users: RawUser[]
		}>(url, {
			ids: _.union(ids).join(',')
		});

		return rest.data.users;

	}, {
	});

	return res;
};


export const useUser = (id: number) => {
	const res = useSWR('/api/user/ids?ids=' + id, async (url) => {

		if (!id) {
			return null;
		}
		const rest = await Fetch.postWithAccessToken<{
			users: RawUser[]
		}>(url, {
			ids: id
		});

		return rest.data.users?.[0];

	}, {
	});

	return res;
}


export const useUserStats = (id: number) => {
	const res = useSWR('/api/user/stats?id=' + id, async (url) => {

		if (!id) {
			return null;
		}

		const rest = await Fetch.postWithAccessToken<{
			user: RawUser,
			record: RawPersonalRecord | null,
			billboard: RawBillboard | null,
			num_submits: number,
			num_done_submits: number,
			badges: RawBadge[],
			code: number,
			listened_words: number,
			latest_active_time: number,
			num_action_logs: number,
			current_order: number,
			billboard_count: number
		}>(url, {
			id: id
		});

		return rest.data;
	}, {
	});

	return res;

}

export function useUserStreak(id?: number) {
  const { data, isLoading, error } = useSWR(id ? ['/api/user/streak', { user_id: id }] : null, Fetch.getFetcher.bind(Fetch));

  return {
    data: (data?.data as AnyObject)?.streak_number ?? 0,
    isLoading,
    error,
  };
}

export function useReloadMe() {
  const { mutate } = useSWRConfig();

  const reloadMe = useCallback(() => {
    mutate('/api/me/profile');
  }, [mutate]);

  return {
    reloadMe,
  };
}

export function useMeListeningTime(id?: number) {
  const { data, isLoading, error, mutate } = useSWR(
    id ? '/api/me/get.listening.time' : null,
    Fetch.getFetcher.bind(Fetch)
  );

  return {
    data: (data?.data as { user: RawUser })?.user,
    isLoading,
    error,
    mutate
  };
}
