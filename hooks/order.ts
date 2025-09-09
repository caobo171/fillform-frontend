import Fetch from '@/lib/core/fetch/Fetch';
import { RawCredit, RawForm, RawOrder } from '@/store/types';
import useSWR from 'swr'




export const useAdminOrders = (page: number, limit: number, params: any) => {
	const res = useSWR('/api/order/user.list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawOrder[],
			order_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
		});

		return {
			orders: rest.data.orders as RawOrder[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
}

export const useUserOrders = (page: number, limit: number, userId: string, params: any) => {
	const res = useSWR('/api/order/user.list?page=' + page + '&limit=' + limit + '&user_id=' + userId, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawOrder[],
			order_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
			user_id: userId
		});

		return {
			orders: rest.data.orders as RawOrder[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
}




export const useMyOrders = (page: number, limit: number, params: any) => {

	const res = useSWR('/api/order/list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawOrder[],
			order_num: number,
		}>(url, {
			...params,
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

type OrderDetailRequest = {
	index: number,
	result: string,
	data: string,
	start_time: number
}

export const useOrderById = (id: string) => {
	const res = useSWR(`/api/order/detail?id=${id}`, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			order: RawOrder,
			order_detail_list: OrderDetailRequest[],
			order_fail_list: string[],
			credit: RawCredit,
			config: any
		}>(url, {
			id: id
		});

		return {
			order: rest.data.order as RawOrder,
			order_detail_list: rest.data.order_detail_list as OrderDetailRequest[],
			order_fail_list: rest.data.order_fail_list as string[],
			credit: rest.data.credit as RawCredit,
			config: rest.data.config as any
		};
	});

	return res;
}
