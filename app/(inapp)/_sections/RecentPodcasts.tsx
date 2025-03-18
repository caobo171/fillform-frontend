'use client';

import { cloneDeep, reverse } from 'lodash';
import { useMemo } from 'react';

import { PodcastItemHorizontal } from '@/app/(inapp)/home/_components/PodcastItemHorizontal';
import { Section } from '@/app/(inapp)/home/_components/Section';
import { useRecentPodcasts } from '@/hooks/podcast';

export default function RecentPodcasts() {
  const { data, isLoading } = useRecentPodcasts();

  const reversedPodcasts = useMemo(() => {
    const copy = cloneDeep(data?.podcasts ?? []);

    return reverse(copy);
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-nowrap gap-10">
          {[1, 2].map((item) => (
            <div
              key={`recent_podcast_${item}`}
              className="h-[96px] w-1/2 rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!reversedPodcasts?.length) {
    return null;
  }

  return (
    <Section title="Nghe gần đây" seeMoreLink="/podcasts">
      <div className="flex flex-wrap gap-x-10 gap-y-8">
        {reversedPodcasts.map(
          (item, index) =>
            index < 4 && (
              <PodcastItemHorizontal
                key={item.id}
                podcast={item}
                className="w-[calc(50%-20px)]"
                showProgress
              />
            )
        )}
      </div>
    </Section>
  );
}
