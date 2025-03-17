import { Metadata } from 'next';

import { Playlist } from '@/app/(inapp)/playlist/Playlist';

export const metadata: Metadata = {
  title: 'Playlist - WELE',
};

export default function Page() {
  return <Playlist />;
}
