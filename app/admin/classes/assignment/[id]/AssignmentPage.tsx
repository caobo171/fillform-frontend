'use client';

import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import {
  CalendarIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import moment from 'moment';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { AssignmentDetailSkeleton } from '@/app/admin/classes/_components/AssignmentDetailSkeleton';
import { AssignmentModal } from '@/app/admin/classes/_components/AssignmentModal';
import { PodcastList } from '@/app/admin/classes/assignment/[id]/_components/PodcastList';
import { StudentList } from '@/app/admin/classes/assignment/[id]/_components/StudentList';
import { ClassApi } from '@/app/admin/classes/classApi';
import { useAssignmentDetail } from '@/app/admin/classes/classHook';
import { Alert, Modal } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { Code } from '@/core/Constants';
import { useUser } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { ExtraPageProps } from '@/store/types';

export default function AssignmentPage({
  params,
  routerGroup,
}: { params: { id: string } } & ExtraPageProps) {
  const { id } = params;

  const router = useRouter();

  const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const { data, isLoading, mutate } = useAssignmentDetail(id);

  const { data: teacher } = useUser(data?.class?.user_id);

  const { trigger: deleteAssignment, isMutating: isDeleting } = useSWRMutation(
    ClassApi.DeleteAssignment,
    Fetch.postFetcher.bind(Fetch)
  );

  const isOverdue = useMemo(() => {
    const endTime = data?.assignment?.end_time ?? 0;

    const currentTime = new Date().getTime();

    return endTime * 1000 < currentTime;
  }, [data]);

  const handleDelete = async () => {
    const res: AnyObject = await deleteAssignment({ payload: { id } });

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    } else {
      router.push(`/${routerGroup}/classes/detail/${data?.class?.id}`);
    }
  };

  const handleUpdateError = (message: string) => {
    toast.error(message);
  };

  const handleUpdateSuccess = (message: string) => {
    toast.success(message);

    setOpenUpdateModal(false);

    mutate();
  };

  if (isLoading) {
    return <AssignmentDetailSkeleton />;
  }

  return (
    <>
      <Modal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        title="Confirm delete"
        okText="Delete"
        okButtonProps={{ loading: isDeleting }}
        onOk={handleDelete}
      >
        <p className="text-sm text-gray-900 py-4">
          Are you sure want to delete assignment{' '}
          <span className="text-primary">{data?.assignment?.name}</span>
        </p>
      </Modal>

      <AssignmentModal
        editMode
        data={data.assignment}
        onError={handleUpdateError}
        onSuccess={handleUpdateSuccess}
        open={openUpdateModal}
        onCancel={() => setOpenUpdateModal(false)}
      />

      <div className="flex flex-col gap-10">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 flex justify-between items-center">
            Assignment details
            <Link
              aria-hidden="true"
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
              href={`/${routerGroup}/classes/detail/${data?.class?.id}`}
            >
              <ArrowLongLeftIcon className="w-auto h-6" />
              Back to class
            </Link>
          </h1>

          <p className="mt-2 text-sm text-gray-700">
            The detailed information of an assignment.
          </p>
        </div>

        {isOverdue && (
          <Alert
            type="warning"
            title="This assignment is overdue"
            content="Overdue assignment is not allowed to add new podcasts or assign to new students. You can extend the deadline to use those functions."
          />
        )}

        <div
          className="rounded-lg bg-white flex gap-4 p-4 bg-cover bg-center"
          style={{ backgroundImage: 'url(/static/bg4.jpg)' }}
        >
          <div className="flex-1 flex flex-col justify-between h-[120px]">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {data?.assignment?.name}
              </h3>

              <p className="text-sm text-gray-500">
                {data?.assignment?.content}
              </p>
            </div>

            <div className="flex gap-10 items-center">
              <Link
                href={`/profile/${teacher?.username}/${teacher?.id}`}
                className="flex gap-2 items-center text-sm text-gray-900"
                target="_blank"
              >
                {teacher && <Avatar user={teacher} size={30} unlink />}
                <span>{teacher?.fullname}</span>
              </Link>

              <div className="flex gap-1.5 items-center text-sm text-gray-900">
                <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
                <span>{data?.class?.name}</span>
              </div>

              <div className="flex gap-2 items-center text-sm text-gray-900">
                <CalendarIcon className="w-5 h-5" />
                <span>
                  {moment((data?.assignment?.start_time ?? 0) * 1000).format(
                    'DD/MM/YYYY hh:mm A'
                  )}
                  &nbsp;-&nbsp;
                  {moment((data?.assignment?.end_time ?? 0) * 1000).format(
                    'DD/MM/YYYY hh:mm A'
                  )}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <TrashIcon
              title="Delete"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setOpenDeleteModal(true)}
            />

            <PencilSquareIcon
              title="Edit"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setOpenUpdateModal(true)}
            />
          </div>
        </div>

        <PodcastList
          assignment={data.assignment}
          isOverdue={isOverdue}
          reloadAssignment={mutate}
        />

        <StudentList
          assignment={data.assignment}
          weleClass={data.class}
          isOverdue={isOverdue}
          reloadAssignment={mutate}
        />
      </div>
    </>
  );
}
