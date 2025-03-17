'use client';

import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import {
  CalendarIcon,
  ChartBarSquareIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';
import moment from 'moment';
import Link from 'next/link';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';

import { AssignmentDetailSkeleton } from '@/app/admin/classes/_components/AssignmentDetailSkeleton';
import { Table, TableProps } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import { useUser } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawPodcast, RawUserClass } from '@/store/types';

export default function AssignmentPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [students, setStudents] = useState<RawUserClass[]>([]);

  const [podcasts, setPodcasts] = useState<RawPodcast[]>([]);

  const assignmentState = useAsync(async () => {
    const res: AnyObject = await Fetch.postWithAccessToken<RawUserClass>(
      '/api/weleclass.assignment/detail',
      {
        id,
      }
    );

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    }

    setStudents(res?.data?.assignment?.release_members ?? []);

    setPodcasts(res?.data?.assignment?.release_podcasts ?? []);

    return res?.data ?? {};
  }, [id]);

  // load class teacher

  const teacher = useUser(assignmentState?.value?.class?.owner_id);

  const columnsPodcast: TableProps<RawPodcast>['columns'] = [
    {
      title: 'Tên',
      key: 'image_url',
      className: 'min-w-[200px]',
      render: (data: RawPodcast) => (
        <div className="flex gap-2 items-center">
          <div
            className="w-8 h-8 ring-2 ring-gray-100 bg-cover bg-center rounded"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
            }}
          />
          <span>{data.name}</span>
        </div>
      ),
    },
    {
      title: 'Tác giả',
      key: 'narrator',
      dataIndex: 'narrator',
    },
    {
      title: 'Cấp độ',
      key: 'level',
      dataIndex: 'level',
    },
    {
      title: 'Điểm',
      key: 'score',
      dataIndex: 'score',
    },
    {
      title: 'Chi tiết',
      key: 'action',
      className: 'w-[100px]',
      render: (data: RawPodcast) => (
        <div className="flex gap-3">
          <Link href={`/podcasts/detail/${data.name}/${data.id}`}>
            <PlayIcon
              title="Nghe podcast"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            />
          </Link>
        </div>
      ),
    },
  ];

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
      title: 'Tiến độ',
      key: 'status',
      dataIndex: 'status',
      render: (data: RawUserClass) => {
        if (!data.following?.podcasts.length) {
          return '--';
        }

        return (
          <div className="flex gap-2 items-center">
            {data.following?.stats.submits_num || 0} /{' '}
            {data.following?.podcasts.length || '0'}
          </div>
        );
      },
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
      title: 'Số từ đã nghe',
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
        <div className="flex gap-3">
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

  if (assignmentState?.loading) {
    return <AssignmentDetailSkeleton />;
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="sm:flex-auto">
        <h1 className="text-base font-semibold leading-6 text-gray-900 flex justify-between items-center">
          Chi tiết bài tập
          <Link
            aria-hidden="true"
            className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
            href={`/classes/detail/${assignmentState?.value?.class?.id}`}
          >
            <ArrowLongLeftIcon className="w-auto h-6" />
            Quay lại lớp học
          </Link>
        </h1>

        <p className="mt-2 text-sm text-gray-700">
          Thông tin chi tiết về bài tập bao gồm podcasts và tiến độ làm bài.
        </p>
      </div>

      <div
        className="rounded-lg bg-white flex gap-4 p-4 bg-cover bg-center"
        style={{ backgroundImage: 'url(/static/bg4.jpg)' }}
      >
        <div className="flex-1 flex flex-col justify-between h-[120px]">
          <div className="flex-1">
            <h3 className="text-base font-medium text-gray-900 mb-1">
              {assignmentState?.value?.assignment?.name}
            </h3>

            <p className="text-sm text-gray-500">
              {assignmentState?.value?.assignment?.content}
            </p>
          </div>

          <div className="flex gap-10 items-center">
            <Link
              href={`/profile/${teacher.data?.username}/${teacher.data?.id}`}
              className="flex gap-2 items-center text-sm text-gray-900"
              target="_blank"
            >
              {teacher.data && <Avatar user={teacher.data} size={30} unlink />}
              <span>{teacher.data?.fullname}</span>
            </Link>

            <div className="flex gap-1.5 items-center text-sm text-gray-900">
              <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
              <span>{assignmentState?.value?.class?.name}</span>
            </div>

            <div className="flex gap-2 items-center text-sm text-gray-900">
              <CalendarIcon className="w-5 h-5" />
              <span>
                {moment(
                  (assignmentState?.value?.assignment?.start_time ?? 0) * 1000
                ).format('DD/MM/YYYY hh:mm A')}
                &nbsp;-&nbsp;
                {moment(
                  (assignmentState?.value?.assignment?.end_time ?? 0) * 1000
                ).format('DD/MM/YYYY hh:mm A')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">Podcasts ({podcasts.length})</h3>
        </div>

        <Table columns={columnsPodcast} data={podcasts} />
      </div>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">Học sinh ({students.length})</h3>
        </div>

        <Table columns={columnsStudent} data={students} />
      </div>
    </div>
  );
}
