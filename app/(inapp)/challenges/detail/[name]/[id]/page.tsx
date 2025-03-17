import { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';

import { ChallengeApi } from '@/app/(inapp)/challenges/challengeApi';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import Constants from '@/core/Constants';
import { MetaData } from '@/core/Metadata';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { PageProps } from '@/store/types';

import { ChallengeDetail } from './ChallengeDetail';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const res = await Fetch.postWithAccessToken<{
    challenge: RawChallenge;
    code: number;
  }>(
    ChallengeApi.Get,
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value || '' },
    false,
    false
  );

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    metadataBase: new URL(MetaData.landingPageDomain),
    title: res?.data?.challenge?.name || MetaData.defaultTitle,
    description: !res.data.challenge?.description
      ? MetaData.defaultDescription
      : Helper.purify(res.data.challenge?.description ?? ''),
    openGraph: {
      images: [
        Constants.IMAGE_URL + (res?.data?.challenge?.image_url ?? ''),
        ...previousImages,
      ],
    },
  };
}

export default function Page(props: PageProps) {
  return <ChallengeDetail {...props} />;
}
