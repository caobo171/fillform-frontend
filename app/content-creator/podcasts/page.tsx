import { Metadata } from 'next';

import { Podcasts } from '@/app/content-creator/podcasts/Podcasts';

export const metadata: Metadata = {
  title: 'Podcasts',
};

export default function Page() {
  return <Podcasts routerGroup="content-creator" />;
}
