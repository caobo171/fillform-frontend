import { cookies } from 'next/headers';

import { ContentContextProvider } from '@/app/(inapp)/podcasts/_components/ContentContext';
import { PlayerContextProvider } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { Container } from '@/components/layout/container/container';
import { BreadCrumb } from '@/components/ui/Breadcrumb';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import {
    RawPodcast,
    RawPodcastSubmit,
    RawPodcastTranscription,
    RawUserActionLog,
} from '@/store/types';
import { ResultOverview } from '@/app/(inapp)/podcasts/listen/[name]/[id]/result/_components/Overview';
import { ResultComparision } from '@/app/(inapp)/podcasts/listen/[name]/[id]/result/_components/Comparision';


// eslint-disable-next-line react/display-name
export default async ({
    params,
    searchParams,
}: {
    params: { id: string };
    searchParams?: { [key: string]: string | string[] | undefined };
}) => {
    const res = await Fetch.postWithAccessToken<{
        podcast_submit: RawPodcastSubmit;
        podcast: RawPodcast;
        code: number;
        current_action_logs: RawUserActionLog[];
        transcription: RawPodcastTranscription;
    }>(
        '/api/podcast.submit/detail',
        {
            id: params.id,
        },
        { access_token: searchParams?.access_token as string || '' }
    );

    

    const { podcast } = res.data;
    return (
        <PlayerContextProvider
            podcast={res.data.podcast}
            podcast_submit={res.data.podcast_submit}
        >
            <ContentContextProvider
                podcast={res.data.podcast}
                podcast_submit={res.data.podcast_submit}
            >
                <Container className="md:mt-10 sm:mt-2">
                    <ResultOverview />
                    <ResultComparision />
                </Container>
            </ContentContextProvider>
        </PlayerContextProvider>
    );
};
