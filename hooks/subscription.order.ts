import Fetch from "@/lib/core/fetch/Fetch";
import { RawOrderSubscription } from "@/store/types";
import useSWR from "swr";

export const useUserOrderSubscriptions = (search_params?: URLSearchParams, page_size?: number) => {

	let real_search_params = search_params || new URLSearchParams();
	const res = useSWR('/api/subscription/order/list.user?' + real_search_params.toString(), async (url) => {
		const rest = await Fetch.postWithAccessToken<{ order_num: number, orders: RawOrderSubscription[] }>(url, {
			...Object.fromEntries(real_search_params.entries()),
			page_size: page_size || 12
		});

		return {
			order_num: rest.data?.order_num || 0,
			orders: rest.data?.orders || [],
		}

	}, {

	});

	return res;
};


export const useOrderSubscriptions = (search_params?: URLSearchParams, page_size?: number) => {

	let real_search_params = search_params || new URLSearchParams();
	const res = useSWR('/api/subscription/order/list.admin?' + real_search_params.toString(), async (url) => {
		const rest = await Fetch.postWithAccessToken<{ order_num: number, orders: RawOrderSubscription[] }>(url, {
			...Object.fromEntries(real_search_params.entries()),
			page_size: page_size || 12
		});

		return {
			order_num: rest.data?.order_num || 0,
			orders: rest.data?.orders || [],
		}

	}, {

	});

	return res;
};