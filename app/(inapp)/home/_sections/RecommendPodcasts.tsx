'use client';

import { PodcastItemVertical } from '@/app/(inapp)/home/_components/PodcastItemVertical';
import { Section } from '@/app/(inapp)/home/_components/Section';
import { usePodcasts } from '@/hooks/podcast';

export default function RecommendPodcasts() {
  const { data, isLoading } = usePodcasts(
    new URLSearchParams('order=newest&tag=recommend'),
    16
  );

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-wrap gap-y-8 justify-between">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div
              key={`recommend_podcast_${item}`}
              className="w-[182px] h-[238px] rounded-lg bg-gray-200 animate-pulse"
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
    <Section title="Gợi ý cho bạn" seeMoreLink="/podcasts">
      <div className="flex flex-wrap gap-y-8 justify-between">
        {data.podcasts.map(
          (item, index) =>
            index >= 8 &&
            index < 16 && <PodcastItemVertical key={item.id} podcast={item} />
        )}
      </div>
    </Section>
  );
}
