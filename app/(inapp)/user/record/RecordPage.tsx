'use client';

import React, { useEffect, useMemo } from 'react';
import useSWR from 'swr';

import {
  OverallSkeleton,
  PerformanceSkeleton,
} from '@/app/(inapp)/profile/[name]/[id]/_components/LoadingSkeleton';
import { OverallStats } from '@/app/(inapp)/profile/[name]/[id]/_components/OverallStats';
import { PerformanceChart } from '@/app/(inapp)/user/record/_components/PerformanceChart';
import { WordListFrequency } from '@/app/admin/classes/detail/[id]/user/[user_id]/_components/WordListFrequency';
import { WordListRate } from '@/app/admin/classes/detail/[id]/user/[user_id]/_components/WordListRate';
import { useRecordAnalyze } from '@/hooks/RecordAnalyze/useRecordAnalyze';
import Fetch from '@/lib/core/fetch/Fetch';
import Voice from '@/services/Voice';
import { AnyObject } from '@/store/interface';
import { RawUserStats } from '@/store/types';

export function RecordPage() {
  const { data, isLoading } = useSWR(
    ['/api/me/personal.record', null],
    Fetch.getFetcher.bind(Fetch)
  );

  const userStats: RawUserStats = useMemo(() => {
    const res = data?.data as AnyObject;

    return {
      user: res?.user,
      record: res?.record,
      current_order: res?.current_order,
      num_done_submits: res?.record?.submitted_podcasts,
      num_in_progress: res?.record?.in_progress_podcasts,
      billboard: res?.user,
    };
  }, [data]);

  useEffect(() => {
    Voice.init();
  }, []);

  const {
    wrongWordList,
    correctWordList,
    masterWords,
    notMasterWords,
    valuableWords,
  } = useRecordAnalyze(userStats.record);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <OverallSkeleton />

        <PerformanceSkeleton />
      </div>
    );
  }

  if (!userStats) {
    return null;
  }

  return (
    <div className="flex flex-col gap-8">
      <OverallStats data={userStats} />

      <div className="flex gap-8 items-start">
        <div className="flex flex-col gap-8 w-[35%]">
          <WordListFrequency data={correctWordList} title="Từ nghe đúng" />

          <WordListFrequency data={wrongWordList} title="Từ nghe sai" />

          <WordListRate data={masterWords} title="Từ nắm vững" />

          <WordListRate data={notMasterWords} title="Từ chưa nắm vững" />

          <WordListRate data={valuableWords} title="Từ đã học được qua WELE" />
        </div>

        <PerformanceChart data={userStats} className="flex-1" />
      </div>
    </div>
  );
}
