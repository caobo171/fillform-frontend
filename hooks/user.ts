import Fetch from '@/lib/core/fetch/Fetch';
import { RawUser } from '@/store/types';
import _ from 'lodash';
import useSWR, { useSWRConfig } from 'swr';
import { AnyObject } from '@/store/interface';
import { useCallback } from 'react';
import { BANK_INFO } from '@/core/Constants';


export const useMe = () => {

	const res = useSWR('/api/me/profile', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			user: RawUser,
			code: number
		}>(url, {});
		return rest.data.user;

	}, {
	});

	return res;
}


export const useUserProfile = (id: string) => {
	const res = useSWR('/api/user/profile?id=' + id, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			user: RawUser
		}>(url, {
			id: id
		});
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
			num_submits: number,
			num_done_submits: number,
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

export function useMyBankInfo() {
	const res = useSWR('/api/me/bank.info', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			bank_info: {
				qr_link: string,
				message_credit: string,
				name: string,
				number: string
			}
		}>(url, {});
		return rest.data.bank_info;

	}, {
	});

	return res;
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
