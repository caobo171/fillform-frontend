'use client';

import Link from 'next/link';
import { useMemo } from 'react';

import { Section } from '@/app/(inapp)/home/_components/Section';
import { useSources } from '@/hooks/source';
import { RawPodcastSource } from '@/store/types';

type RawPodcastSourceExpand = {
  color: string;
} & RawPodcastSource;

export default function Source() {
  const { data, isLoading } = useSources();

  const dataRemap = useMemo(() => {
    if (!Array.isArray(data?.sources)) {
      return [];
    }

    const result: RawPodcastSourceExpand[] = [];

    data.sources.forEach((item) => {
      if ([1, 2, 3, 4, 9, 15].includes(item?.id)) {
        let color = '';

        if (item.id === 1) {
          // english at work
          color = '#00817A';
        } else if (item.id === 2) {
          // spotlight english
          color = '#5FB529';
        } else if (item.id === 3) {
          // 6 minutes english
          color = '#62BBB9';
        } else if (item.id === 4) {
          // Transcripting IELTS
          color = '#F9A95A';
        } else if (item.id === 9) {
          // TOEIC
          color = '#153E6D';
        } else if (item.id === 15) {
          // the survior
          color = '#920061';
        }

        result.push({ ...item, color });
      }
    }, []);

    return result;
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex gap-y-4 flex-wrap justify-between">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div
              key={`source_${item}`}
              className="w-[256px] h-[80px] rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Section title="Nguồn" seeMoreLink="/podcasts">
      <div className="flex gap-y-4 flex-wrap justify-between">
        {dataRemap.map((item) => (
          <Link
            href={`/podcasts?source_keys=${item.id}`}
            key={item.id}
            className="w-[256px] h-[80px] text-base font-medium rounded-lg text-white flex items-center justify-center"
            style={{ backgroundColor: item.color }}
          >
            {item.name}
          </Link>
        ))}
      </div>
    </Section>
  );
}
