'use client';

import { usePathname } from 'next/navigation';
import { useContext, useEffect } from 'react';

import { PlayerPanel } from '@/app/_components/Queue/PlayerPanel';
import { PodcastList } from '@/app/_components/Queue/PodcastList';
import { QueueContext } from '@/contexts';
import { PlayerContext } from '@/contexts/PlayerContext';

export function QueueContent() {
  const pathName = usePathname();

  const { queue } = useContext(QueueContext);

  const { togglePlay, playing } = useContext(PlayerContext);

  if (!queue.playing || !queue.podcasts) {
    return null;
  }

  if (
    pathName.includes('/podcasts/listen') ||
    pathName.includes('/authentication')
  ) {
    if (playing) {
      togglePlay(false);
    }

    return null;
  }

  return (
    <>
      <PlayerPanel />
      <PodcastList />
    </>
  );
}
