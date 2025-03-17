import { Metadata, ResolvingMetadata } from 'next';
import { cookies } from 'next/headers';

import { Container } from '@/components/layout/container/container';
import Constants from '@/core/Constants';
import { MetaData } from '@/core/Metadata';
import Fetch from '@/lib/core/fetch/Fetch';
import { ProfileProps } from '@/store/types';

import { ProfilePage } from './ProfilePage';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const res = await Fetch.postWithAccessToken<ProfileProps>(
    '/api/user/basic.info',
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value || '' }
  );

  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  const { user } = res.data ?? {};

  return {
    metadataBase: new URL(MetaData.landingPageDomain),
    title: `${user?.fullname} - WELE`,
    description: `${user?.fullname} - WELE`,
    openGraph: {
      images: [
        user?.avatar ? Constants.IMAGE_URL + user.avatar : '',
        ...previousImages,
      ],
    },
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return (
    <div className="bg-gray-50 min-h-screen mb-[-40px] pb-6">
      <Container>
        <ProfilePage id={params.id} />
      </Container>
    </div>
  );
}
