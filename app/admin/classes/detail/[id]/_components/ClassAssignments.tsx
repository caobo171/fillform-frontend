import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import moment from 'moment/moment';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { AssignmentModal } from '@/app/admin/classes/_components/AssignmentModal';
import { Modal, Table, TableProps } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import {
  ExtraPageProps,
  RawAssignment,
  RawUser,
  RawWeleClass,
} from '@/store/types';

type ClassAssignmentsProps = {
  classData?: RawWeleClass;
  studentData?: RawUser[];
  assignmentData?: RawAssignment[];
  routerGroup: ExtraPageProps['routerGroup'];
};

export function ClassAssignments(props: ClassAssignmentsProps) {
  const { classData, routerGroup, assignmentData, studentData } = props;

  const [assignments, setAssignments] = useState<RawAssignment[]>([]);

  const [assignmentWillBeRemoved, setAssignmentWillBeRemoved] =
    useState<RawAssignment>();

  const [openAssignmentModal, setOpenAssignmentModal] =
    useState<boolean>(false);

  const [deletingAssignment, setDeletingAssignment] = useState<boolean>(false);

  useEffect(() => {
    setAssignments(assignmentData ?? []);
  }, [assignmentData]);

  const handleAddError = (message: string) => {
    toast.error(message);
  };

  const handleAddSuccess = (message: string, data?: RawAssignment) => {
    toast.success(message);

    setOpenAssignmentModal(false);

    if (data) {
      setAssignments([data, ...assignments]);
    }
  };

  const handleDeleteAssignment = async () => {
    setDeletingAssignment(true);

    const res: AnyObject = await Fetch.postWithAccessToken(
      '/api/weleclass.assignment/remove',
      {
        id: assignmentWillBeRemoved?.id,
      }
    );

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    } else {
      toast.success('Assignment removed!');

      setAssignmentWillBeRemoved(undefined);
    }

    setDeletingAssignment(false);
  };

  const columnsAssignment: TableProps<RawAssignment>['columns'] = [
    {
      title: 'Name',
      key: 'name',
      className: 'w-[330px]',
    },
    {
      title: 'Students',
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
                      user={studentData?.find((s) => s.id === item.user_id)}
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
    },
    {
      title: 'Start time',
      key: 'start_time',
      dataIndex: 'start_time',
      render: (data: RawAssignment) =>
        moment(data.start_time * 1000).format('DD/MM/YYYY hh:mm A'),
    },
    {
      title: 'End time',
      key: 'end_time',
      dataIndex: 'end_time',
      render: (data: RawAssignment) =>
        moment(data.end_time * 1000).format('DD/MM/YYYY hh:mm A'),
    },
    {
      title: 'Number of podcasts',
      key: 'number_of_podcasts',
      dataIndex: 'number_of_podcasts',
      render: (data: RawAssignment) => data?.podcasts?.length,
    },

    {
      title: 'Status',
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
          return <span className="text-gray-500">Closed</span>;
        }

        if (toStartTime > 0) {
          return <span className="text-blue-500">Coming</span>;
        }

        if (toEndTime > 0 && toEndTime < aDayInMillisecond) {
          return <span className="text-red-500">Due soon</span>;
        }

        if (toEndTime > aDayInMillisecond) {
          return <span className="text-green-500">On going</span>;
        }

        return null;
      },
    },
    {
      title: 'Action',
      key: 'action',
      className: 'w-[120px]',
      render: (data: RawAssignment) => (
        <div className="flex gap-3">
          <TrashIcon
            title="Delete"
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() => setAssignmentWillBeRemoved(data)}
          />

          <Link href={`/${routerGroup}/classes/assignment/${data.id}`}>
            <ArrowLongRightIcon
              title="Detail"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            />
          </Link>
        </div>
      ),
    },
  ];

  return (
    <>
      <AssignmentModal
        onError={handleAddError}
        onSuccess={handleAddSuccess}
        open={openAssignmentModal}
        onCancel={() => setOpenAssignmentModal(false)}
        classId={String(classData?.id)}
      />

      <Modal
        title="Confirm delete assignment"
        open={!!assignmentWillBeRemoved}
        onCancel={() => setAssignmentWillBeRemoved(undefined)}
        onOk={handleDeleteAssignment}
        okText="Delete"
        okButtonProps={{ loading: deletingAssignment }}
      >
        <p className="text-sm text-gray-900 py-2">
          Are you sure want to delete assignment&nbsp;
          <span className="text-primary">{assignmentWillBeRemoved?.name}</span>?
        </p>
      </Modal>

      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end">
          <h3 className="font-semibold">Assignments ({assignments?.length})</h3>

          <div
            aria-hidden="true"
            className="outline-none bg-primary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-primary-900"
            onClick={() => setOpenAssignmentModal(true)}
            title="Add new assignment"
          >
            <PlusIcon className="w-5 h-5 text-white" />
          </div>
        </div>

        <Table columns={columnsAssignment} data={assignments} />
      </div>
    </>
  );
}
