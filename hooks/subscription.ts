import Fetch from "@/lib/core/fetch/Fetch";
import { RawOrderSubscription, RawSubscription } from "@/store/types";
import useSWR from "swr";

export const useSubscriptions = (search_params?: URLSearchParams, page_size?: number) => {

	let real_search_params = search_params || new URLSearchParams();
	const res = useSWR('/api/subscription/list.admin?' + real_search_params.toString(), async (url) => {
		const rest = await Fetch.postWithAccessToken<{ subscription_num: number, subscriptions: RawSubscription[] }>(url, {
			...Object.fromEntries(real_search_params.entries()),
			page_size: page_size || 12
		});

		return {
			subscription_num: rest.data?.subscription_num || 0,
			subscriptions: rest.data?.subscriptions || [],
		}

	}, {

	});

	return res;
};