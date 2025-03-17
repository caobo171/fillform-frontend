import { Metadata } from 'next';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawPodcast, RawPodcastSubmit, RawUserActionLog } from '@/store/types';
import { PlayerContextProvider } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { ContentContextProvider } from '@/app/(inapp)/podcasts/_components/ContentContext';
import { PodcastEditor } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastEditor';
import { PodcastActions } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastActions';
import { PodcastContent } from './_components/PodcastContent';


export const metadata: Metadata = {
    title: 'Nghe podcast - WELE',
    description: 'Nghe podcast - WELE',
};

export default async function Page({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}) {
    const res = await Fetch.postWithAccessToken<{
        podcast_submit: RawPodcastSubmit;
        podcast: RawPodcast;
        code: number;
        current_action_logs: RawUserActionLog[];
    }>(
        '/api/podcasts/get.listen',
        {
            id: params.id,
            metatype: searchParams?.type,
        },
        { access_token: searchParams?.access_token as string || '' }
    );

    if (!res.data.podcast) {
        return <div>Not found</div>
    }

    return (

        <PlayerContextProvider
            podcast={res.data.podcast}
            podcast_submit={res.data.podcast_submit}
        >
            <ContentContextProvider
                podcast={res.data.podcast}
                podcast_submit={res.data.podcast_submit}
            >
                <PodcastContent />
            </ContentContextProvider>

        </PlayerContextProvider>
    );
}
