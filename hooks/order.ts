import Fetch from '@/lib/core/fetch/Fetch';
import { RawForm, RawOrder } from '@/store/types';
import useSWR from 'swr'


export const useMyOrders = (page: number, limit: number) => {

	const res = useSWR('/api/order/list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawOrder[],
			order_num: number,
		}>(url, {
			page: page,
			page_size: limit
		});

		return {
			orders: rest.data.orders as RawOrder[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
};


export const useOrderById = (id: string) => {
	const res = useSWR(`/api/order/detail?id=${id}`, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			order: RawOrder,
			order_detail_list: any[],
			order_fail_list: any[],
			config: any
		}>(url, {
			id: id
		});

		return {
			order: rest.data.order as RawOrder,
			order_detail_list: rest.data.order_detail_list as any[],
			order_fail_list: rest.data.order_fail_list as any[],
			config: rest.data.config as any
		};
	});

	return res;
}
