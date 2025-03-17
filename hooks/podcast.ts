import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { RawChallenge, RawPodcast, RawPodcastSubmit } from '@/store/types';
import useSWR from 'swr'


/**
 * @desc Hook to fetch recent podcasts
 * @returns 
 */
export const useRecentPodcasts = () => {

	const res = useSWR('/api/podcasts/home/recent', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			recent_podcasts: RawPodcast[],
			podcast_submits: RawPodcastSubmit[]
		}>(url, {});

		return {
			podcasts: rest.data.recent_podcasts as RawPodcast[],
			my_podcast_submits: rest.data.podcast_submits as RawPodcastSubmit[],
		}

	}, {

	});

	return res;
}


export const useNewPodcasts = () => {
	const res = useSWR('/api/podcasts/home/new', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			new_podcasts: RawPodcast[],
			podcast_submits: RawPodcastSubmit[]
		}>(url, {});



		return {
			podcasts: rest.data.new_podcasts as RawPodcast[],
			my_podcast_submits: rest.data.podcast_submits as RawPodcastSubmit[],
		}

	}, {

	});


	return res;
};


export const usePodcasts = (search_params?: URLSearchParams, page_size?: number) => {

	let real_search_params = search_params || new URLSearchParams();
	const res = useSWR('/api/podcasts/list?' + real_search_params.toString(), async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			podcasts: RawPodcast[],
			podcast_num: number,
			podcast_submits: RawPodcastSubmit[]
		}>(url, {
			...Object.fromEntries(real_search_params.entries()),
			page_size: page_size || 12
		});

		return {
			podcasts: rest.data.podcasts as RawPodcast[],
			podcast_num: rest.data.podcast_num as number,
		}

	}, {

	});

	return res;
};


export const usePodcastSubmitByPodcastId = (id: number, user_id: number | undefined = undefined) => {
	const res = useSWR(`/api/podcast.submit/detail?id=${id}&user_id=${user_id}`, async (url: string) => {
		const rest = await Fetch.postWithAccessToken<{
			podcast: RawPodcast,
			podcast_submit: RawPodcastSubmit
			code: number
		}>(url, {
			id: id,
			user_id: user_id
		});

		return {
			podcast: rest.data.podcast as RawPodcast,
			podcast_submit: rest.data.podcast_submit as RawPodcastSubmit
		}

	}, {

	});

	return res;
};


export const usePodcastSubmitById = (id: number) => {
	const res = useSWR(`/api/podcast.submit/byid?id=${id}`, async (url: string) => {
		const rest = await Fetch.postWithAccessToken<{
			podcast: RawPodcast,
			podcast_submit: RawPodcastSubmit
			code: number
		}>(url, {
			id: id,
		});

		return {
			podcast: rest.data.podcast as RawPodcast,
			podcast_submit: rest.data.podcast_submit as RawPodcastSubmit
		}

	}, {

	});

	return res;
}


export const useRecommendPodcasts = () => {
	const res = useSWR('/api/podcasts/recommend', async (url) => {
		const rest = await Fetch.postWithAccessToken<{
			podcasts: RawPodcast[],
			podcast_submits: RawPodcastSubmit[]
		}>(url, {});



		return {
			podcasts: rest.data.podcasts as RawPodcast[],
		}

	}, {

	});


	return res;
}