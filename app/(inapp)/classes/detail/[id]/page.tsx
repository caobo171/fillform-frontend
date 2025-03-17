import { Metadata } from 'next';
import { cookies } from 'next/headers';

import { MetaData } from '@/core/Metadata';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawWeleClass } from '@/store/types';

import ClassDetailPage from './ClassDetailPage';

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const res = await Fetch.postWithAccessToken<{ weleclass: RawWeleClass }>(
    '/api/wele.class/detail',
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value ?? '' }
  );

  const weleclass = res?.data?.weleclass;

  return {
    metadataBase: new URL(MetaData.appDomain),
    title: `${weleclass?.name} - Lớp học - WELE`,
    description: weleclass?.content || MetaData.defaultDescription,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClassDetailPage params={params} />;
}
