import { cookies } from 'next/headers';

import { ContentContextProvider } from '@/app/(inapp)/podcasts/_components/ContentContext';
import { PlayerContextProvider } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { PlayerPanel } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PlayerPanel';
import { Container } from '@/components/layout/container/container';
import { BreadCrumb } from '@/components/ui/Breadcrumb';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import { AnyObject } from '@/store/interface';
import {
  RawPodcast,
  RawPodcastSubmit,
  RawPodcastTranscription,
  RawUserActionLog,
} from '@/store/types';

import { ResultBillboard } from './_components/Billboard';
import { ResultComparision } from './_components/Comparision';
import { ResultOverview } from './_components/Overview';
import { WordAnalyze } from './_components/WordAnalyze';

// eslint-disable-next-line react/display-name
export default async ({ params }: { params: { id: string } }) => {
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
    { access_token: cookies().get('access_token')?.value || '' }
  );

  const podcast = res.data?.podcast;

  if (!podcast){
    return <div>Podcast not found</div>
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
        <div className="min-h-screen bg-gray-50 mb-[-40px] pt-[32px] pb-[40px]">
          <Container className="flex flex-col gap-10">
            <BreadCrumb
              pages={[
                {
                  name: 'Podcasts',
                  href: '/podcasts',
                },
                {
                  name: res.data.podcast.name,
                  href: Podcast.getURL(res.data.podcast),
                  current: true,
                },
                {
                  name: 'Result',
                  href: Podcast.getResultURL(res.data.podcast),
                  current: true,
                },
              ]}
            />

            <div className="w-full flex gap-8">
              <div className="w-full semi-md:w-1/2 flex flex-col gap-6">
                <ResultOverview />

                <WordAnalyze />
              </div>

              <div className="w-full semi-md:w-1/2">
                <ResultBillboard
                  members={
                    podcast.members.length > 0 && podcast.members[0]?.percent
                      ? podcast.members.sort((a: AnyObject, b: AnyObject) => {
                          if ((b?.percent || 0) === (a?.percent || 0)) {
                            return b.score - a.score;
                          }

                          return b.percent - a.percent;
                        })
                      : podcast.members.sort((a, b) => b.score - a.score)
                  }
                />
              </div>
            </div>

            <ResultComparision />

            <PlayerPanel />
          </Container>
        </div>
      </ContentContextProvider>
    </PlayerContextProvider>
  );
};
