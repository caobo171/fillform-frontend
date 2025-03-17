'use client';

import React, { useMemo } from 'react';
import useSWR from 'swr';

import { ClassDetailSkeleton } from '@/app/admin/classes/_components/ClassDetailSkeleton';
import { ClassAssignments } from '@/app/admin/classes/detail/[id]/_components/ClassAssignments';
import { ClassInfo } from '@/app/admin/classes/detail/[id]/_components/ClassInfo';
import { ClassStats } from '@/app/admin/classes/detail/[id]/_components/ClassStats';
import { ClassStudents } from '@/app/admin/classes/detail/[id]/_components/ClassStudents';
import { Alert } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { ExtraPageProps } from '@/store/types';

export function ClassDetailPage({
  params,
  routerGroup,
}: { params: { id: string } } & ExtraPageProps) {
  const { id } = params;

  const { data, error, isLoading, mutate } = useSWR(
    id ? ['/api/wele.class/detail', { id }] : null,
    Fetch.getFetcher.bind(Fetch)
  );

  const weleClass = useMemo(() => {
    if (!data) {
      return null;
    }

    const rawData = data?.data as AnyObject;

    return {
      classData: rawData?.weleclass,
      students: rawData?.weleclass?.release_members ?? [],
      assignments: rawData?.assignments ?? [],
    };
  }, [data]);

  if (isLoading) {
    return <ClassDetailSkeleton />;
  }

  if (error || (data as AnyObject)?.data?.code === Code.Error) {
    return <Alert type="error" title="Something went wrong!" />;
  }

  return (
    <div className="flex flex-col gap-10">
      <ClassInfo
        data={weleClass?.classData}
        routerGroup={routerGroup}
        reFetchClass={mutate}
      />

      <ClassStats data={weleClass?.classData} />

      <ClassAssignments
        classData={weleClass?.classData}
        studentData={weleClass?.students}
        assignmentData={weleClass?.assignments}
        routerGroup={routerGroup}
      />

      <ClassStudents
        classData={weleClass?.classData}
        routerGroup={routerGroup}
      />
    </div>
  );
}
