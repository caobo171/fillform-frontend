'use client';

import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import React, { useEffect } from 'react';

import { OverallStats } from '@/app/(inapp)/profile/[name]/[id]/_components/OverallStats';
import { useStudentDetail } from '@/app/admin/classes/classHook';
import { Feedback } from '@/app/admin/classes/detail/[id]/user/[user_id]/_components/Feedback';
import { WordListFrequency } from '@/app/admin/classes/detail/[id]/user/[user_id]/_components/WordListFrequency';
import { WordListRate } from '@/app/admin/classes/detail/[id]/user/[user_id]/_components/WordListRate';
import Avatar from '@/components/ui/Avatar';
import { useRecordAnalyze } from '@/hooks/RecordAnalyze/useRecordAnalyze';
import Voice from '@/services/Voice';

import { SubmitList } from './_components/SubmitList';

type StudentDetailPageProps = {
  classId: string;
  studentId: string;
  routerGroup?: string;
};

export function StudentDetailPage(props: StudentDetailPageProps) {
  const { classId, studentId, routerGroup } = props;

  const { data, isLoading } = useStudentDetail(classId, studentId);

  const {
    wrongWordList,
    correctWordList,
    masterWords,
    notMasterWords,
    valuableWords,
  } = useRecordAnalyze(data?.record);

  useEffect(() => {
    Voice.init();
  }, []);

  if (isLoading) {
    return null;
  }

  if (!data?.record) {
    return (
      <div className="text-center text-sm text-gray-900">
        Không tìm thấy thông tin học sinh
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Avatar user={data?.user} size={40} unlink />
            <span className="text-base font-medium text-gray-900">
              {data?.user?.fullname}
            </span>
          </div>

          <Link
            aria-hidden="true"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
            href={`/${routerGroup}/classes/detail/${classId}`}
          >
            <ArrowLongLeftIcon className="w-auto h-6" />
            Back to class
          </Link>
        </h1>
      </div>

      <div className="flex gap-8">
        <div className="w-1/3 flex flex-col gap-8">
          <Feedback classId={classId} studentId={studentId} />

          <WordListFrequency title="Correct words" data={correctWordList} />

          <WordListFrequency title="Wrong words" data={wrongWordList} />

          <WordListRate data={masterWords} title="Mastered words" />

          <WordListRate data={notMasterWords} title="Not mastered words" />

          <WordListRate data={valuableWords} title="Learned from WELE" />
        </div>

        <div className="w-2/3 flex flex-col gap-10">
          <OverallStats data={data} />

          <SubmitList data={data?.podcast_submits ?? []} />

          {/* <PerformanceChart data={data} /> */}
        </div>
      </div>
    </div>
  );
}
