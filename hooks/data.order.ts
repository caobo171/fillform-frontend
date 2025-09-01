import Fetch from '@/lib/core/fetch/Fetch';
import { RawForm, RawDataOrderModel } from '@/store/types';
import useSWR from 'swr'




export const useAdminDataOrders = (page: number, limit: number, params: any) => {
	const res = useSWR('/api/data.order/user.list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawDataOrderModel[],
			order_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
		});

		return {
			orders: rest.data.orders as RawDataOrderModel[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
}

export const useUserDataOrders = (page: number, limit: number, userId: string, params: any) => {
	const res = useSWR('/api/data.order/user.list?page=' + page + '&limit=' + limit + '&user_id=' + userId, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawDataOrderModel[],
			order_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
			user_id: userId
		});

		return {
			orders: rest.data.orders as RawDataOrderModel[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
}




export const useMyDataOrders = (page: number, limit: number, params: any) => {

	const res = useSWR('/api/data.order/list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			orders: RawDataOrderModel[],
			order_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit
		});

		return {
			orders: rest.data.orders as RawDataOrderModel[],
			order_num: rest.data.order_num as number,
		}

	}, {

	});

	return res;
};

export const useDataOrderById = (id: string) => {
	const res = useSWR(`/api/data.order/detail?id=${id}`, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			order: RawDataOrderModel,
		}>(url, {
			id: id
		});

		return {
			order: rest.data.order as RawDataOrderModel,
		};
	});

	return res;
}
