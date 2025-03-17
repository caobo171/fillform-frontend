import { Metadata } from 'next';
import { cookies } from 'next/headers';

import AssignmentPage from '@/app/admin/classes/assignment/[id]/AssignmentPage';
import { MetaData } from '@/core/Metadata';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawAssignment } from '@/store/types';

type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const res = await Fetch.postWithAccessToken<{ assignment: RawAssignment }>(
    '/api/weleclass.assignment/detail',
    {
      id: params.id,
    },
    { access_token: cookies().get('access_token')?.value ?? '' }
  );

  const assignment = res?.data?.assignment;

  return {
    metadataBase: new URL(MetaData.appDomain),
    title: `${assignment?.name} - Assignment - WELE`,
    description: assignment?.content || MetaData.defaultDescription,
  };
}

export default function Page({ params }: { params: { id: string } }) {
  return <AssignmentPage params={params} routerGroup="admin" />;
}
