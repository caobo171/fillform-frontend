import { Metadata } from 'next';

import { Podcasts } from '@/app/admin/podcasts/Podcasts';

export const metadata: Metadata = {
  title: 'Podcasts',
};

export default function Page() {
  return <Podcasts />;
}
