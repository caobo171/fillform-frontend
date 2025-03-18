'use client';

import { PodcastItemHorizontal } from '@/app/(inapp)/home/_components/PodcastItemHorizontal';
import { Section } from '@/app/(inapp)/home/_components/Section';
import { usePodcasts } from '@/hooks/podcast';

export default function PopularPodcasts() {
  const { data, isLoading } = usePodcasts(
    new URLSearchParams('order=mostview'),
    10
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="w-[150px] h-[24px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={`popular_podcast_${item}`}
              className="h-[96px] w-full rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Section
      title="Nghe nhiều nhất"
      seeMoreLink="/podcasts?order=mostview"
      className="gap-6"
      titleClassName="text-base"
      seeMoreClassName="text-xs"
    >
      <div className="flex flex-col gap-6">
        {data.podcasts.map(
          (item, index) =>
            index < 5 && (
              <PodcastItemHorizontal
                key={item.id}
                podcast={item}
                ranking={index + 1}
              />
            )
        )}
      </div>
    </Section>
  );
}
