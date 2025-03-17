'use client';

import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import {
  ChatBubbleOvalLeftEllipsisIcon,
  DocumentTextIcon,
  MicrophoneIcon,
  UserCircleIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { differenceBy } from 'lodash';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';
import { v4 as uuidv4 } from 'uuid';

import { ClassListSkeleton } from '@/app/admin/classes/_components/ClassListSkeleton';
import { ClassApi } from '@/app/admin/classes/classApi';
import { Button } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import { AnyObject } from '@/store/interface';
import { ExtraPageProps, RawAssignment, RawWeleClass } from '@/store/types';

import { ClassModal } from './_components/ClassModal';

export function ClassesPage({ routerGroup }: ExtraPageProps) {
  const searchParams = useSearchParams();

  const isSuperAdmin = useMemo(
    () => searchParams.get('is_super_admin') === 'true',
    [searchParams]
  );

  const getClassesUrl = useMemo(
    () =>
      isSuperAdmin ? ClassApi.SuperAdminGetClasses : ClassApi.AdminGetClasses,
    [isSuperAdmin]
  );

  const [openAddModal, setOpenAddModal] = useState<boolean>(false);

  const [classList, setClassList] = useState<RawWeleClass[]>([]);

  const [uuid, setUuid] = useState<string>();

  const classListState = useAsync(async () => {
    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      getClassesUrl,
      {
        page_size: 12,
      }
    );

    if (res?.data?.code === Code.Error) {
      Toast.error(res?.data?.message);
    }

    return {
      classes: res?.data?.classes ?? [],
      class_num: res?.data?.class_num ?? 0,
    };
  }, [uuid]);

  const assignmentListState = useAsync(async () => {
    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/weleclass.assignment/list.admin',
      {
        page_size: 12,
      }
    );

    if (res?.data?.code === Code.Error) {
      Toast.error(res?.data?.message);
    }

    return {
      assignments: res?.data?.assignments ?? [],
      assignment_num: res?.data?.assignment_num ?? 0,
    };
  }, []);

  useEffect(() => {
    let classes = classListState?.value?.classes ?? [];

    const assignments = assignmentListState?.value?.assignments ?? [];

    // count number of assignment for each class
    classes = classes.map((cls: RawWeleClass) => {
      const numberOfAssignment = assignments.filter(
        (asg: RawAssignment) => cls.id === asg.class_id
      ).length;

      return { ...cls, assignment_num: numberOfAssignment };
    });

    setClassList(classes);
  }, [classListState?.value?.classes, assignmentListState?.value?.assignments]);

  const totalStudents = useMemo(() => {
    if (!Array.isArray(classListState?.value?.classes)) {
      return [];
    }

    let students: { user_id: number }[] = [];

    classListState.value.classes.forEach((cls: RawWeleClass) => {
      students = [...students, ...(cls.members ?? [])];
    });

    // eslint-disable-next-line
    // @ts-ignore
    return differenceBy(students, 'user_id');
  }, [classListState?.value?.classes]);

  const totalPodcasts = useMemo(() => {
    let result = 0;

    if (!assignmentListState?.value?.assignments) {
      return result;
    }

    assignmentListState?.value?.assignments.forEach((item: RawAssignment) => {
      if (Array.isArray(item.podcasts)) {
        result += item.podcasts.length;
      }
    });

    return result;
  }, [assignmentListState?.value?.assignments]);

  const handleAddError = (message: string) => {
    toast.error(message);
  };

  const handleAddSuccess = (message: string) => {
    toast.success(message);

    setOpenAddModal(false);

    setUuid(uuidv4());
  };

  if (classListState?.loading) {
    return <ClassListSkeleton />;
  }

  return (
    <>
      <ClassModal
        onError={handleAddError}
        onSuccess={handleAddSuccess}
        open={openAddModal}
        onCancel={() => setOpenAddModal(false)}
      />

      <div className="flex flex-col pb-4">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Classes
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              A list all of the classes including overall statistics in this
              account.
            </p>
          </div>

          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button size="small" onClick={() => setOpenAddModal(true)}>
              Add class
            </Button>
          </div>
        </div>

        <div className="flex gap-8 mb-12">
          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-emerald-500">
            <div className="w-14 h-14 rounded-lg bg-emerald-600 flex items-center justify-center">
              <ChatBubbleOvalLeftEllipsisIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-between text-white">
              <span className="text-2xl font-medium">
                {classListState?.value?.classes?.length ?? 0}
              </span>
              <span className="text-sm">Total classes</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-red-500">
            <div className="w-14 h-14 rounded-lg bg-red-600 flex items-center justify-center">
              <UsersIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-between text-white">
              <span className="text-2xl font-medium">
                {totalStudents?.length ?? 0}
              </span>
              <span className="text-sm">Total students</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-blue-500">
            <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
              <DocumentTextIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-between text-white">
              <span className="text-2xl font-medium">
                {assignmentListState?.value?.assignments?.length}
              </span>
              <span className="text-sm">Total assignments</span>
            </div>
          </div>

          <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-purple-500">
            <div className="w-14 h-14 rounded-lg bg-purple-600 flex items-center justify-center">
              <MicrophoneIcon className="w-6 h-6 text-white" />
            </div>

            <div className="flex flex-col justify-between text-white">
              <span className="text-2xl font-medium">{totalPodcasts}</span>
              <span className="text-sm">Total podcasts assigned</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          {classList.map((item: RawWeleClass) => (
            <Link
              key={item.id}
              className="flex flex-col shadow-sm bg-white rounded-lg p-4 cursor-pointer hover:shadow transition-all w-[calc(25%-(32px*3/4))]"
              href={`/${routerGroup}/classes/detail/${item.id}`}
            >
              <div
                className="w-full h-[120px] rounded-lg mb-4 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${Constants.IMAGE_URL}${item.image_url})`,
                }}
              />

              <h3 className="text-base font-medium text-gray-900 mb-4">
                {item.name}
              </h3>
              <div className="flex-1">
                <p className="flex gap-2 items-center mb-2">
                  <DocumentTextIcon className="w-5 h-5 text-gray-700" />
                  <span className="text-sm text-gray-700">
                    {item?.assignment_num} assignments
                  </span>
                </p>

                <p className="flex gap-2 items-center mb-6">
                  <UserCircleIcon className="w-5 h-5 text-gray-700" />
                  <span className="text-sm text-gray-700">
                    Teacher: {item?.user?.fullname}
                  </span>
                </p>
              </div>

              <div className="flex items-center">
                {item?.release_members?.length === 0 && (
                  <span className="text-sm text-gray-900 flex items-center gap-2">
                    Add student to class
                    <ArrowLongRightIcon className="w-5 h-5 text-gray-500" />
                  </span>
                )}
                {item?.release_members?.map(
                  (mem, index) =>
                    index < 3 && (
                      <Avatar key={mem.id} user={mem} unlink size={32} />
                    )
                )}
                {Number(item?.release_members?.length) > 3 && (
                  <div className="w-8 h-8 rounded-full ring-2 ring-gray-200 bg-gray-200 text-xs text-gray-500 flex items-center justify-center">
                    +{Number(item.release_members?.length) - 3}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
