import { Metadata } from 'next';

import { PlaylistDetail } from './PlaylistDetail';

export const metadata: Metadata = {
  title: 'Playlist - WELE',
};

export default function Page({ params }: { params: { id: string } }) {
  return <PlaylistDetail id={params.id} />;
}
