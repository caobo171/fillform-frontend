import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import moment from 'moment/moment';
import Link from 'next/link';
import React from 'react';

import { TableProps } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { RawAssignment, RawUser } from '@/store/types';

export const getColumnsAssignment = (
  students: RawUser[],
  showClass?: boolean,
  disableGoToAssignment?: boolean
): TableProps<RawAssignment>['columns'] => {
  let extraColumn: TableProps<RawAssignment>['columns'][0];

  if (showClass) {
    extraColumn = {
      title: 'Lớp',
      key: 'class_name',
      dataIndex: 'class_name',
      className: 'h-[48px]',
    };
  } else {
    extraColumn = {
      title: 'Học sinh',
      key: 'students',
      dataIndex: 'students',
      render: (data: RawAssignment) => {
        if (data?.members?.length) {
          return (
            <div className="flex items-center">
              {data?.members?.map(
                (item, index) =>
                  index < 3 && (
                    <Avatar
                      key={item.user_id}
                      // eslint-disable-next-line
                      // @ts-ignore
                      user={students.find((s) => s.id === item.user_id)}
                      unlink
                      size={30}
                    />
                  )
              )}
              {data?.members?.length > 3 && (
                <div className="w-[30px] h-[30px] rounded-full ring-2 ring-gray-200 bg-gray-200 text-xs text-gray-500 flex items-center justify-center">
                  +{(data?.members?.length ?? 0) - 3}
                </div>
              )}
            </div>
          );
        }

        return '0';
      },
    };
  }

  const cols = [
    {
      title: 'Tên',
      key: 'name',
      className: 'w-[350px]',
    },
    { ...extraColumn },
    {
      title: 'Ngày bắt đầu',
      key: 'start_time',
      dataIndex: 'start_time',
      render: (data: RawAssignment) =>
        moment(data.start_time * 1000).format('DD/MM/YYYY'),
    },
    {
      title: 'Ngày kết thúc',
      key: 'end_time',
      dataIndex: 'end_time',
      render: (data: RawAssignment) =>
        moment(data.end_time * 1000).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lượng bài nghe',
      key: 'number_of_podcasts',
      dataIndex: 'number_of_podcasts',
      render: (data: RawAssignment) => data?.podcasts?.length,
    },
    {
      title: 'Trạng thái',
      key: 'status',
      dataIndex: 'end_time',
      render: (data: RawAssignment) => {
        const startTime = moment(data.start_time * 1000).valueOf();

        const endTime = moment(data.end_time * 1000).valueOf();

        const current = moment(new Date()).valueOf();

        const toStartTime = startTime - current;

        const toEndTime = endTime - current;

        const aDayInMillisecond = 24 * 60 * 60 * 1000;

        if (toEndTime < 0) {
          return <span className="text-gray-500">Kết thúc</span>;
        }

        if (toStartTime > 0) {
          return <span className="text-blue-500">Sắp diễn ra</span>;
        }

        if (toEndTime > 0 && toEndTime < aDayInMillisecond) {
          return <span className="text-red-500">Sắp đến hạn</span>;
        }

        if (toEndTime > aDayInMillisecond) {
          return <span className="text-green-500">Đang diễn ra</span>;
        }

        return null;
      },
    },
  ];

  if (!disableGoToAssignment) {
    cols.push({
      title: 'Chi tiết',
      key: 'action',
      className: 'w-[100px]',
      render: (data: RawAssignment) => (
        <div className="flex gap-3">
          <Link href={`/classes/assignment/${data.id}`}>
            <ArrowLongRightIcon
              title="Chi tiết"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            />
          </Link>
        </div>
      ),
    });
  }

  return cols;
};
