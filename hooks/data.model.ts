import Fetch from '@/lib/core/fetch/Fetch';
import { RawDataModel } from '@/store/types';
import useSWR from 'swr'



export const useUserDataModels = (page: number, limit: number, userId: string, params: any) => {

	const res = useSWR('/api/data.model/user.list?page=' + page + '&limit=' + limit + '&user_id=' + userId, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			data_models: RawDataModel[],
			data_model_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
			user_id: userId
		});

		return {	
			data_models: rest.data.data_models as RawDataModel[],
			data_model_num: rest.data.data_model_num as number,
		}

	}, {

	});

	return res;
}


export const useMyDataModels = (page: number, limit: number, params: any) => {
			
	const res = useSWR('/api/data.model/list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			data_models: RawDataModel[],
			data_model_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit
		});

		return {
			data_models: rest.data.data_models as RawDataModel[],
			data_model_num: rest.data.data_model_num as number,
		}

	}, {

	});

	return res;
};


export const useDataModelById = (id: string) => {
	const res = useSWR(`/api/data.model/detail?id=${id}`, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			data_model: RawDataModel,
		}>(url, {
			id: id
		});

		return {
			data_model: rest.data.data_model as RawDataModel,
		};
	});

	return res;
}
