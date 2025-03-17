import { ArrowLongLeftIcon } from '@heroicons/react/20/solid';
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';

import { ClassModal } from '@/app/admin/classes/_components/ClassModal';
import { ClassSetting } from '@/app/admin/classes/detail/[id]/_components/ClassSetting';
import { Modal } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { ExtraPageProps, RawWeleClass } from '@/store/types';

type ClassInfoProps = {
  data?: RawWeleClass;
  routerGroup: ExtraPageProps['routerGroup'];
  // /api/wele.class/detail api mutation
  reFetchClass: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function ClassInfo(props: ClassInfoProps) {
  const { data, routerGroup, reFetchClass } = props;

  const router = useRouter();

  const isPublic = data?.is_public;

  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);

  const [deletingClass, setDeletingClass] = useState<boolean>(false);

  const [openUpdateClassModal, setOpenUpdateClassModal] =
    useState<boolean>(false);

  const handleDeleteClass = async () => {
    setDeletingClass(true);

    const res: AnyObject = await Fetch.postWithAccessToken(
      '/api/wele.class/remove',
      {
        id: data?.id,
      }
    );

    if (res?.data?.code === Code.Error) {
      toast.error(res?.data?.message);
    } else {
      router.push(`/${routerGroup}/classes`);
    }

    setDeletingClass(false);
  };

  const handleUpdateClassError = (message: string) => {
    toast.error(message);
  };

  const handleUpdateClassSuccess = (message: string) => {
    toast.success(message);

    setOpenUpdateClassModal(false);

    reFetchClass();
  };

  return (
    <>
      <ClassModal
        editMode
        onError={handleUpdateClassError}
        onSuccess={handleUpdateClassSuccess}
        open={openUpdateClassModal}
        onCancel={() => setOpenUpdateClassModal(false)}
        data={data}
      />

      <Modal
        title="Confirm delete class"
        open={showDeleteModal}
        onCancel={() => setShowDeleteModal(false)}
        onOk={handleDeleteClass}
        okText="Delete"
        okButtonProps={{ loading: deletingClass }}
      >
        <p className="text-sm text-gray-900 py-4">
          Are you sure want to delete class&nbsp;
          <span className="text-primary">{data?.name}</span>?
        </p>
      </Modal>

      <div className="flex flex-col gap-10">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900 flex items-center justify-between">
            Class details
            <Link
              aria-hidden="true"
              className="flex items-center gap-1 text-sm text-gray-700 hover:text-gray-900 font-normal cursor-pointer"
              href={`/${routerGroup}/classes`}
            >
              <ArrowLongLeftIcon className="w-auto h-6" />
              Back to class list
            </Link>
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            The detailed information of a class including overall performance,
            students, assignments.
          </p>
        </div>

        <div className="rounded-lg bg-white flex gap-4 p-4">
          <div
            className="w-[248px] h-[120px] bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL}${data?.image_url})`,
            }}
          />

          <div className="flex-1 flex flex-col justify-between items-start h-[120px]">
            <div className="flex-1">
              <h3 className="text-base font-medium text-gray-900 mb-1">
                {data?.name}

                {isPublic ? (<span className='text-green-900 text-sm bg-green-200 ml-2 p-1 rounded-md'>Public</span>) : ((<span className='text-blue-900 text-sm bg-blue-200 ml-2 p-1 rounded-md'>Private</span>))}
              </h3>

              <p className="text-sm text-gray-500">{data?.content}</p>
            </div>

            <Link
              href={`/profile/${data?.owner?.username}/${data?.owner?.id}`}
              className="flex gap-2 items-center text-sm text-gray-900"
              target="_blank"
            >
              {data?.owner ? (
                <>
                  <Avatar user={data?.owner} unlink size={32} />
                  <span>{data?.owner?.fullname}</span>
                </>
              ) : null}
            </Link>
          </div>

          <div className="flex gap-4">
            <TrashIcon
              title="Delete"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setShowDeleteModal(true)}
            />

            <PencilSquareIcon
              title="Edit"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setOpenUpdateClassModal(true)}
            />

            <ClassSetting data={data} reFetchClass={reFetchClass} />
          </div>
        </div>
      </div>
    </>
  );
}
