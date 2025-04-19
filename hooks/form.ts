import Fetch from '@/lib/core/fetch/Fetch';
import { RawForm } from '@/store/types';
import useSWR from 'swr'



export const useUserForms = (page: number, limit: number, userId: string, params: any) => {

	const res = useSWR('/api/form/user.list?page=' + page + '&limit=' + limit + '&user_id=' + userId, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			forms: RawForm[],
			form_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit,
			user_id: userId
		});

		return {	
			forms: rest.data.forms as RawForm[],
			form_num: rest.data.form_num as number,
		}

	}, {

	});

	return res;
}


export const useMyForms = (page: number, limit: number, params: any) => {
			
	const res = useSWR('/api/form/list?page=' + page + '&limit=' + limit, async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			forms: RawForm[],
			form_num: number,
		}>(url, {
			...params,
			page: page,
			page_size: limit
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
			config: any,
			latest_form_questions: any[],
			latest_form_sections: any[],
		}>(url, {
			id: id
		});

		return {
			form: rest.data.form as RawForm,
			config: rest.data.config as any,
			latest_form_sections: rest.data.latest_form_sections as any[],
			latest_form_questions: rest.data.latest_form_questions as any[]
		};
	});

	return res;
}
