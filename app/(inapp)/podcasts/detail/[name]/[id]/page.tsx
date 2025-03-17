import { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';

import { Container } from '@/components/layout/container/container';
import { BreadCrumb } from '@/components/ui/Breadcrumb';
import Constants from '@/core/Constants';
import { MetaData } from '@/core/Metadata';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import { Helper } from '@/services/Helper';
import { RawPodcast } from '@/store/types';

import { DisplayDesc } from './_components/DisplayDesc';
import { DisplayHeader } from './_components/DisplayHeader';
import { DisplayInfo } from './_components/DisplayInfo';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const res = await Fetch.postWithAccessToken<{
    podcast: RawPodcast;
    is_listening: boolean;
    is_submitted: boolean;
    code: number;
  }>(
    '/api/podcasts/detail',
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value || '' },
    false,
    false
  );

  if (!res.data?.podcast) {
    return {
      metadataBase: new URL(MetaData.landingPageDomain),
      title: 'Podcast không tồn tại',
      description: 'Podcast không tồn tại',
    };
  }

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    metadataBase: new URL(MetaData.landingPageDomain),
    title:
      `${res.data.podcast?.name} - ESL ${res.data.podcast?.sub_name}` ||
      MetaData.defaultTitle,
    description:
      (Helper.purify(res.data.podcast?.description) || 
      MetaData.defaultDescription ) + ' Nghe chép chính tả',
    openGraph: {
      images: [
        Constants.IMAGE_URL + res.data.podcast?.image_url,
        ...previousImages,
      ],
    },
  };
}

export default async ({ params }: { params: { id: string } }) => {
  // Fetch podcasts
  const res = await Fetch.postWithAccessToken<{
    podcast: RawPodcast;
    is_listening: boolean;
    is_submitted: boolean;
    code: number;
  }>(
    '/api/podcasts/detail',
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value || '' },
    false,
    false
  );

  const { podcast } = res.data;

  if (!podcast) {
    return <div>Podcast not found</div>;
  }

  return (
    <div className="bg-gray-50 min-h-screen mb-[-40px]">
      <Container className="py-6 flex flex-col gap-8">
        <BreadCrumb
          pages={[
            {
              name: 'Podcasts',
              href: '/podcasts',
            },
            {
              name: podcast?.name,
              href: Podcast.getURL(res.data.podcast),
              current: true,
            },
          ]}
        />

        <div className="flex flex-col-reverse md:flex-row">
          <div className="flex-1 w-full md:w-full md:pr-[140px]">
            <DisplayHeader podcast={podcast} />
            <DisplayDesc podcast={podcast} />
          </div>

          <div className="w-full md:w-[400px]">
            <DisplayInfo podcast={podcast} />
          </div>
        </div>
      </Container>
    </div>
  );
};
