'use client';

import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import {
  ChartBarSquareIcon,
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';

import { getColumnsAssignment } from '@/app/(inapp)/classes/_components/columnsDef';
import { Feedback } from '@/app/(inapp)/classes/detail/[id]/Feedback';
import { PlayAllPodcasts } from '@/app/(inapp)/classes/detail/[id]/PlayAllPodcasts';
import { Subscribe } from '@/app/(inapp)/classes/detail/[id]/Subscribe';
import { ClassDetailSkeleton } from '@/app/admin/classes/_components/ClassDetailSkeleton';
import { Alert, Table, TableProps } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants from '@/core/Constants';
import { useMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawAssignment, RawUserClass, RawWeleClass } from '@/store/types';

export default function ClassDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [students, setStudents] = useState<RawUserClass[]>([]);

  const { data: meData } = useMe();

  const {
    data: classRawData,
    isLoading,
    mutate,
    error,
  } = useSWR(['/api/wele.class/detail', { id }], Fetch.getFetcher.bind(Fetch));

  const classData = useMemo(() => {
    const rawData = classRawData?.data as AnyObject;

    setStudents(rawData?.weleclass?.release_members ?? []);

    return {
      weleclass: rawData?.weleclass as RawWeleClass,
      assignments: rawData?.assignments as RawAssignment[],
    };
  }, [classRawData]);

  const isPublic = classData?.weleclass?.is_public;

  const isJoined = useMemo(
    () =>
      !!classData?.weleclass?.members?.find((m) => m.user_id === meData?.id),
    [classData, meData?.id]
  );

  const assignments = useMemo(() => {
    if (!classData.assignments) {
      return [];
    }

    const showOverdueAssignment =
      classData?.weleclass?.data?.settings?.show_expired_podcasts === 1;

    return classData?.assignments?.filter((asg: RawAssignment) => {
      const currentTime = new Date().getTime();

      // hide ongoing assignment
      if (asg.start_time * 1000 > currentTime) {
        return false;
      }

      // hide overdue assignment
      if (!showOverdueAssignment && asg.end_time * 1000 < currentTime) {
        return false;
      }

      return asg;
    });
  }, [classData]);

  const myAssignments = useMemo(() => {
    if (!meData || !assignments) {
      return [];
    }

    const myId = meData.id;

    return assignments?.filter(
      (item) => !!item?.members?.find((m) => m.user_id === myId)
    );
  }, [meData, assignments]);

  const otherAssignments = useMemo(() => {
    if (!meData || !assignments) {
      return [];
    }

    const myId = meData.id;

    return assignments?.filter(
      (item) => !item?.members?.find((m) => m.user_id === myId)
    );
  }, [meData, assignments]);

  const columnsStudent: TableProps<RawUserClass>['columns'] = [
    {
      title: 'Tên',
      key: 'image_url',
      className: 'min-w-[200px]',
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          <Avatar user={data} size={30} />
          <span>{data.fullname}</span>
        </div>
      ),
    },
    {
      title: 'Bài đã nộp',
      key: 'submissions',
      dataIndex: 'submissions',
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {data.following?.stats.submits_num || 0}
        </div>
      ),
    },
    {
      title: 'Thời gian nghe',
      key: 'time',
      dataIndex: 'time',
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {Helper.getTimeListen(data.following?.stats.listen_time || 0)}
        </div>
      ),
    },
    {
      title: 'Từ đã nghe',
      key: 'words',
      dataIndex: 'words',
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {data.following?.stats.unique_correct_words_num || 0}
        </div>
      ),
    },
    {
      title: 'Độ chính xác',
      key: 'accuracy',
      dataIndex: 'accuracy',
      render: (data: RawUserClass) => (
        <div className="flex gap-2 items-center">
          {((data.following?.stats.avg_accuracy || 0) * 100).toFixed(2)}%
        </div>
      ),
    },
    {
      title: 'Chi tiết',
      key: 'action',
      className: 'w-[100px]',
      render: (data: RawUserClass) => (
        <div className="flex gap-3 ">
          <Link href={`/profile/${data.username}/${data.id}`} target="_blank">
            <ChartBarSquareIcon
              title="Chi tiết"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            />
          </Link>
        </div>
      ),
    },
  ];

  const Actions = useMemo(() => {
    if (isPublic && !isJoined) {
      return <Subscribe data={classData?.weleclass} reloadClass={mutate} />;
    }

    return (
      <>
        <Feedback classId={id} />

        <PlayAllPodcasts assignments={classData?.assignments ?? []} />
      </>
    );
  }, [classData, id, isJoined, isPublic, mutate]);

  if (isLoading) {
    return <ClassDetailSkeleton />;
  }

  if (error) {
    return <Alert type="error" title="Something went wrong!" />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900 flex items-center justify-between">
          Thông tin lớp học
          <Link
            aria-hidden="true"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
            href="/classes"
          >
            <ArrowLongLeftIcon className="w-auto h-6" />
            Tất cả lớp học
          </Link>
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Chi tiết về lớp học của bạn, bao gồm học sinh, bài tập, tiến độ làm
          bài của lớp.
        </p>
      </div>

      <div className="rounded-lg bg-white flex gap-4 p-4">
        <div
          className="w-[248px] h-[120px] bg-cover bg-center rounded-lg"
          style={{
            backgroundImage: `url(${Constants.IMAGE_URL}${classData?.weleclass?.image_url})`,
          }}
        />

        <div className="flex-1 flex flex-col justify-between items-start h-[120px]">
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {classData?.weleclass?.name}

              {isPublic ? (
                <span className="text-green-900 text-sm bg-green-200 ml-2 p-1 rounded-md">
                  Public
                </span>
              ) : (
                <span className="text-blue-900 text-sm bg-blue-200 ml-2 p-1 rounded-md">
                  Private
                </span>
              )}
            </h3>

            <p className="text-sm text-gray-500">
              {classData?.weleclass?.content}
            </p>
          </div>

          <div className="flex items-center gap-10">
            <Link
              href={`/profile/${classData?.weleclass?.owner?.username}/${classData?.weleclass?.owner?.id}`}
              className="flex gap-2 items-center text-sm text-gray-900"
              target="_blank"
            >
              {classData?.weleclass?.owner ? (
                <>
                  <Avatar user={classData?.weleclass?.owner} unlink size={32} />
                  <span>{classData?.weleclass?.owner?.fullname}</span>
                </>
              ) : null}
            </Link>

            <div className="flex gap-4">{Actions}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h3 className="text-sm font-semibold">Kết quả tổng quan</h3>

        <div className="flex gap-8">
          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-emerald-100 text-emerald-600">
            <div className="w-14 h-14 rounded-lg bg-emerald-200 flex items-center justify-center">
              <DocumentArrowUpIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {classData?.weleclass?.stats?.submits_num}
              </span>
              <span className="text-sm">Bài đã nộp</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-orange-100 text-orange-600">
            <div className="w-14 h-14 rounded-lg bg-orange-200 flex items-center justify-center">
              <ClockIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {Helper.getTimeListen(
                  classData?.weleclass?.stats?.listen_time || 0,
                  true
                )}
              </span>
              <span className="text-sm">Thời gian nghe</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-blue-100 text-blue-600">
            <div className="w-14 h-14 rounded-lg bg-blue-200 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {classData?.weleclass?.stats?.unique_correct_words_num || 0}
              </span>
              <span className="text-sm">Từ đã nghe</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-purple-100 text-purple-600">
            <div className="w-14 h-14 rounded-lg bg-purple-200 flex items-center justify-center">
              <CheckBadgeIcon className="w-6 h-6" />
            </div>

            <div className="flex flex-col justify-between">
              <span className="text-2xl font-medium">
                {(
                  (classData?.weleclass?.stats?.avg_accuracy || 0) * 100
                ).toFixed(2)}
                %
              </span>
              <span className="text-sm">Độ chính xác</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end">
          <h3 className="font-semibold">
            Bài tập của bạn ({myAssignments.length})
          </h3>
        </div>

        <Table
          columns={
            getColumnsAssignment(students, false, isPublic && !isJoined) ?? []
          }
          data={myAssignments}
          noDataText="Chưa có dữ liệu"
        />
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end">
          <h3 className="font-semibold">
            Bài tập khác trong lớp ({otherAssignments.length})
          </h3>
        </div>

        <Table
          columns={
            getColumnsAssignment(students, false, isPublic && !isJoined) ?? []
          }
          data={otherAssignments}
          noDataText="Chưa có dữ liệu"
        />
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">Học sinh ({students.length})</h3>
        </div>

        <Table
          columns={columnsStudent}
          data={students}
          noDataText="Chưa có dữ liệu"
        />
      </div>
    </div>
  );
}
