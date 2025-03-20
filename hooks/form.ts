import Fetch from '@/lib/core/fetch/Fetch';
import { RawForm } from '@/store/types';
import useSWR from 'swr'


export const useForms = (search_params?: URLSearchParams, page_size?: number) => {

	let real_search_params = search_params || new URLSearchParams();
	const res = useSWR('/api/form/list?' + real_search_params.toString(), async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			forms: RawForm[],
			form_num: number,
		}>(url, {
			...Object.fromEntries(real_search_params.entries()),
			page_size: page_size || 12
		});

		return {
			forms: rest.data.forms as RawForm[],
			form_num: rest.data.form_num as number,
		}

	}, {

	});

	return res;
};


export const useFormById = (id: string) => {
	const res = useSWR(`/api/form/detail?id=${id}`, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			form: RawForm,
			config: any
		}>(url, {
			id: id
		});

		return {
			form: rest.data.form as RawForm,
			config: rest.data.config as any
		};
	});

	return res;
}
