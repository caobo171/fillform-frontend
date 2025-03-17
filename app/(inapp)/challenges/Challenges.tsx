'use client';

import Link from 'next/link';
import React from 'react';

import { ChallengeItem } from '@/app/(inapp)/challenges/_components/ChallengeItem';
import { useChallenges } from '@/app/(inapp)/challenges/challengeHook';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { General } from '@/app/(inapp)/challenges/detail/[name]/[id]/_components/General';
import { Button } from '@/components/common';
import { Challenge } from '@/modules/challenge/challenge';

export function Challenges() {
  const { data, isLoading } = useChallenges({ page: 1, page_size: 100 });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        <div className="flex items-start">
          <div className="flex-auto">
            <div className="h-[24px] w-[100px] rounded animate-pulse bg-gray-200" />
            <div className="mt-2 h-[20px] w-[200px] rounded animate-pulse bg-gray-200" />
          </div>
        </div>

        <div className="h-[332px] w-full rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-col gap-3">
          <div className="h-[24px] w-[100px] rounded animate-pulse bg-gray-200" />

          <div className="flex flex-wrap gap-8 mb-12">
            {[1, 2, 3, 4].map((index) => (
              <div
                key={index}
                className="w-[284px] h-[334px] rounded-lg bg-gray-200 animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start">
        <div className="flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Thử thách
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách tất cả thử thách hiện tại của WELE
          </p>
        </div>
      </div>

      {!!data[0] && (
        <General
          challenge={data[0]}
          linkButton={
            <Link href={Challenge.getURL(data[0])}>
              <Button size="large">Tìm hiểu thêm</Button>
            </Link>
          }
        />
      )}

      <div className="flex flex-col gap-3">
        <h4 className="text-base font-semibold text-gray-900">
          Tất cả ({data?.length})
        </h4>

        <div className="flex flex-wrap gap-8 mb-12">
          {data.map((item: RawChallenge) => (
            <ChallengeItem data={item} key={item.id} />
          ))}
        </div>
      </div>
    </div>
  );
}
