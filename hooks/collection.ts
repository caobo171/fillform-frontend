import Fetch from '@/lib/core/fetch/Fetch';
import { RawPodcast, RawPodcastCollection, RawPodcastSubmit, RawSubscription, RawUser, RawUserPlaylist, RawWeleClass } from '@/store/types';
import useSWR from 'swr'


export const useCollections = () => {

    const res = useSWR('/api/podcast.collection/list', async (url) => {
        const rest = await Fetch.postWithAccessToken<{
            podcast_collections: RawPodcastCollection[]
        }>(url, {});

        return {
            collections: (rest.data.podcast_collections as RawPodcastCollection[] || []).sort((a, b) => a.position - b.position),
        }

    }, {

    });

    return res;
}


export const useCollectionByID = (id: number) => {

    const data = useCollections();

    return data.data?.collections.find((source) => source.id == id);
}