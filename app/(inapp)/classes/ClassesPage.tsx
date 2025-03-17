'use client';

import { DocumentTextIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';
import { useAsync } from 'react-use';

import { ClassListSkeleton } from '@/app/(inapp)/classes/_components/ClassListSkeleton';
import { getColumnsAssignment } from '@/app/(inapp)/classes/_components/columnsDef';
import { Table } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import { AnyObject } from '@/store/interface';
import { RawAssignment, RawWeleClass } from '@/store/types';

function ClassItem({ data }: { data: RawWeleClass }) {
  return (
    <Link
      key={data.id}
      className="flex flex-col bg-white shadow-sm rounded-lg p-4 cursor-pointer hover:shadow transition-all w-[calc(25%-(32px*3/4))]"
      href={`/classes/detail/${data.id}`}
    >
      <div
        className="w-full h-[120px] rounded-lg mb-4 bg-cover bg-center"
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
        }}
      />

      <h3 className="text-base font-medium text-gray-900 mb-4">{data.name}</h3>
      <div className="flex-1">
        <p className="flex gap-2 items-center mb-2">
          <DocumentTextIcon className="w-5 h-5 text-gray-700" />
          <span className="text-sm text-gray-700">
            {data.assignments_ids?.length || 0} bài tập
          </span>
        </p>

        <p className="flex gap-2 items-center mb-6">
          <UserCircleIcon className="w-5 h-5 text-gray-700" />
          <span className="text-sm text-gray-700">
            Giáo viên: {data?.owner?.fullname}
          </span>
        </p>
      </div>

      <div className="flex items-center">
        {data?.release_members?.length === 0 && (
          <span className="text-sm text-gray-900 flex items-center gap-2">
            Chưa có học sinh
          </span>
        )}
        {data?.release_members?.map(
          (mem, index) =>
            index < 3 && <Avatar key={mem.id} user={mem} unlink size={32} />
        )}
        {Number(data?.release_members?.length) > 3 && (
          <div className="w-8 h-8 rounded-full ring-2 ring-gray-200 bg-gray-200 text-xs text-gray-500 flex items-center justify-center">
            +{Number(data.release_members?.length) - 3}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ClassesPage() {
  const [classList, setClassList] = useState<RawWeleClass[]>([]);

  const [assignmentList, setAssignmentList] = useState<RawAssignment[]>([]);

  const classListState = useAsync(async () => {
    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/wele.class/list',
      {
        page_size: 100,
      }
    );

    if (res?.data?.code === Code.Error) {
      Toast.error(res?.data?.message);
    }

    return {
      classes: res?.data?.classes ?? [],
      class_num: res?.data?.class_num ?? 0,
    };
  }, []);

  const assignmentListState = useAsync(async () => {
    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/weleclass.assignment/list',
      {
        page_size: 100,
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

    const filteredAssignment: RawAssignment[] = [];

    // get class name of each assignment, also filter out overdue class
    assignments.forEach((asg: RawAssignment) => {
      const currentClass = classes.find(
        (cls: RawWeleClass) => cls.id === asg.class_id
      );

      const showOverdueAssignment =
        currentClass?.data?.settings?.show_expired_podcasts === '1';

      const currentTime = new Date().getTime();

      if (!showOverdueAssignment && asg.end_time * 1000 < currentTime) {
        // do nothing
      } else {
        filteredAssignment.push({ ...asg, class_name: currentClass?.name });
      }
    });

    setClassList(classes);

    setAssignmentList(filteredAssignment);
  }, [classListState?.value?.classes, assignmentListState?.value?.assignments]);

  const privateClasses = useMemo(
    () => classList.filter((cls: RawWeleClass) => !cls.is_public),
    [classList]
  );

  const publicClasses = useMemo(
    () => classList.filter((cls: RawWeleClass) => cls.is_public),
    [classList]
  );

  if (classListState?.loading || assignmentListState?.loading) {
    return <ClassListSkeleton />;
  }

  return (
    <div className="flex flex-col pb-4 gap-12">
      {!!assignmentList?.length && (
        <div className="flex flex-col gap-3 text-sm text-gray-900">
          <div className="flex justify-between items-end">
            <h3 className="font-semibold">
              Bài tập của bạn ({assignmentList?.length})
            </h3>
          </div>

          <Table
            columns={getColumnsAssignment([], true)}
            data={assignmentList}
            noDataText="Chưa có dữ liệu"
          />
        </div>
      )}

      {!!privateClasses?.length && (
        <div className="flex flex-col gap-4">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Lớp học của bạn ({privateClasses.length})
          </h1>

          <div className="flex flex-wrap gap-8">
            {privateClasses.map((item: RawWeleClass) => (
              <ClassItem data={item} key={item.id} />
            ))}
          </div>
        </div>
      )}

      {!!publicClasses?.length && (
        <div className="flex flex-col gap-4">
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Lớp học công khai ({publicClasses.length})
          </h2>

          <div className="flex flex-wrap gap-8">
            {publicClasses.map((item: RawWeleClass) => (
              <ClassItem data={item} key={item.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
