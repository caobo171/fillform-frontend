import Fetch from '@/lib/core/fetch/Fetch';
import { RawChallenge, RawPodcast, RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '@/store/types';
import useSWR from 'swr'


export const useActiveChallenges = () => {

    const res = useSWR('/api/challenges/home', async (url) => {
        const rest = await Fetch.postWithAccessToken<{
            challenges: RawChallenge[],
            podcasts: RawPodcast[]
        }>(url, {});

        return {
            challenges: rest.data.challenges as RawChallenge[],
            related_podcasts: rest.data.podcasts as RawPodcast[],
        }

    }, {
    });

    return res;
}