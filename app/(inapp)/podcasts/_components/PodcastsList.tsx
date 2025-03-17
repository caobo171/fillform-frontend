'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

import { Filters } from '@/app/(inapp)/podcasts/_components/Filters';
import { PodcastItem } from '@/app/(inapp)/podcasts/_components/PodcastItem';
import { Pagination, Tabs, TabsProps } from '@/components/common';
import { useCollections } from '@/hooks/collection';
import { usePodcasts } from '@/hooks/podcast';
import { useSources } from '@/hooks/source';
import { useQueryString } from '@/hooks/useQueryString';

const PAGE_SIZE = 12;

export function PodcastList() {
  const { createQueryString } = useQueryString();

  const router = useRouter();

  const searchParams = useSearchParams();

  const searchText = searchParams.get('q');

  const scope = searchParams.get('scope') ?? 'all';

  const currentPage = searchParams.get('page') ?? '1';

  const { data, isLoading } = usePodcasts(searchParams);

  const { podcasts = [], podcast_num: total = 0 } = data ?? {};

  const { data: sourceData } = useSources();

  const { data: collectionData } = useCollections();

  // it would be better to have number of podcasts for each tab
  const TabOptions: TabsProps['options'] = useMemo(
    () => [
      {
        label: 'Tất cả',
        value: 'all',
        link: '/podcasts?page=1',
      },
      {
        label: 'Bài bạn đăng',
        value: 'mine',
        link: '/podcasts?page=1&scope=mine',
        isPremium: true,
      },
      {
        label: 'Bài đang nghe',
        value: 'listening',
        link: '/podcasts?page=1&scope=listening',
      },
      {
        label: 'Bài đã nghe',
        value: 'listened',
        link: '/podcasts?page=1&scope=listened',
      },
    ],
    []
  );

  const handlePageChange = useCallback(
    (value: number) => {
      const newQueryString = createQueryString('page', String(value));

      router.push(`/podcasts?${newQueryString}`);
    },
    [createQueryString, router]
  );

  const content = useMemo(() => {
    if (isLoading) {
      // render skeleton
      return (
        <div className="flex flex-col gap-6 mt-2">
          {new Array(12).fill(0).map((_, index) => (
            <div
              key={index}
              className="h-[120px] w-full rounded-lg bg-gray-200 animate-pulse mb-4"
            />
          ))}
        </div>
      );
    }

    if (podcasts.length === 0) {
      return (
        <div className="flex flex-col py-8">
          <img
            src="/static/svg/no_result.svg"
            className="w-[200px] h-auto mb-6"
            alt="no result"
          />

          <h3 className="text-base text-gray-900 mb-1">
            Không tìm thấy kết quả
          </h3>
          <p className="text-sm text-gray-600">
            Thử tìm kiếm với từ khóa hoặc bộ lọc khác bạn nhé
          </p>
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6 mt-2">
        {podcasts.map((e) => (
          <PodcastItem
            key={e.id}
            data={e}
            sources={sourceData?.sources ?? []}
            collections={collectionData?.collections ?? []}
          />
        ))}
      </div>
    );
  }, [isLoading, podcasts, sourceData?.sources, collectionData?.collections]);

  return (
    <div className="w-[800px] flex flex-col gap-6">
      <Tabs options={TabOptions} defaultActiveKey={scope} />

      <Filters />

      {searchText && (
        <span className="text-sm text-gray-600">
          Bạn đang tìm kiếm với từ khóa:{' '}
          <span className="text-primary">{searchText}</span>
        </span>
      )}

      {content}

      {total > PAGE_SIZE && (
        <Pagination
          total={total}
          current={Number(currentPage)}
          pageSize={PAGE_SIZE}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}
