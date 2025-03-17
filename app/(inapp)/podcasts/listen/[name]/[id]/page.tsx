import { Metadata } from 'next';
import { cookies } from 'next/headers';

import { PlayerPanel } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PlayerPanel';
import { PodcastContent } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastContent';
import { PodcastInfo } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastInfo';
import { Container } from '@/components/layout/container/container';
import { BreadCrumb } from '@/components/ui/Breadcrumb';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import { RawPodcast, RawPodcastSubmit, RawUserActionLog } from '@/store/types';

import { ContentContextProvider } from '../../../_components/ContentContext';
import { PlayerContextProvider } from '../../../_components/PlayerContext';

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
    { access_token: cookies().get('access_token')?.value || '' }
  );

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
          <Container className="flex flex-col gap-6">
            <div className="mb-2">
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
                    name: 'Listen',
                    href: Podcast.getListenURL(res.data.podcast),
                    current: true,
                  },
                ]}
              />
            </div>

            <PodcastInfo />

            <PodcastContent
              current_action_logs={res.data.current_action_logs}
            />

            <PlayerPanel />
          </Container>
        </div>
      </ContentContextProvider>
    </PlayerContextProvider>
  );
}
