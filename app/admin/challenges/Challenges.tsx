'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import React, { useCallback, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Type } from '@/app/(inapp)/challenges/challengeConstant';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { AddEditForm } from '@/app/admin/challenges/_components/AddEditForm';
import { ChallengeAction } from '@/app/admin/challenges/_components/ChallengeAction';
import { useChallenges } from '@/app/admin/challenges/challengeHook';
import { Button, Table, TableProps } from '@/components/common';
import Constants from '@/core/Constants';

dayjs.extend(localizedFormat);

export function Challenges() {
  const {
    data: challengeList,
    isValidating,
    isLoading,
    mutate,
  } = useChallenges(1, 100);

  const [openAddEditModal, setOpenAddEditModal] = useState<boolean>(false);

  const [challengeWillBeEdited, setChallengeWillBeEdited] =
    useState<RawChallenge>();

  const handleOpenEditModal = useCallback((data: RawChallenge) => {
    setChallengeWillBeEdited(data);

    setOpenAddEditModal(true);
  }, []);

  const handleOpenAddNewModal = useCallback(() => {
    setChallengeWillBeEdited(undefined);

    setOpenAddEditModal(true);
  }, []);

  const columns: TableProps<RawChallenge>['columns'] = useMemo(
    () => [
      {
        title: 'Id',
        key: 'id',
        dataIndex: 'id',
        className: 'w-16',
      },
      {
        title: 'Image',
        key: 'background_image',
        className: 'w-16',
        render: (data: RawChallenge) => (
          <div
            className="w-16 h-8 rounded bg-center bg-cover"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
            }}
          />
        ),
      },
      {
        title: 'Name',
        key: 'name',
        dataIndex: 'name',
        className: 'max-w-[200px]',
      },
      {
        title: 'Description',
        key: 'description',
        dataIndex: 'description',
        render: (data: RawChallenge) => (
          <p
            className="w-[300px] line-clamp-1"
            title={data?.description ?? ''}
            dangerouslySetInnerHTML={{ __html: data?.description ?? '' }}
          />
        ),
      },
      {
        title: 'Podcasts',
        key: 'podcast_points',
        render: (data: RawChallenge) => data?.podcasts_data?.length,
      },
      {
        title: 'Time',
        key: 'time_settings',
        render: (data: RawChallenge) => {
          const isLimitTime = data.type === Type.TimeLimit;

          const limitTimeValue = data?.data?.time_limit ?? 0;

          if (isLimitTime) {
            return `${Math.floor(limitTimeValue / 86400)} days`;
          }

          if (data?.data?.start_time && data?.data?.end_time) {
            const startTime = dayjs(data.data.start_time * 1000).format(
              'DD/MM/YYYY'
            );

            const endTime = dayjs(data.data.end_time * 1000).format(
              'DD/MM/YYYY'
            );

            return `${startTime} - ${endTime}`;
          }

          return null;
        },
      },
      {
        title: 'Status',
        key: 'status',
        render: (data: RawChallenge) => (
          <span
            className={clsx({
              'text-red-500': data.metatype === 'FINISHED_STATUS',
            })}
          >
            {data.metatype === 'FINISHED_STATUS' ? 'Finished' : 'Ongoing'}
          </span>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        render: (data: RawChallenge) => (
          <ChallengeAction
            data={data}
            reloadChallenges={mutate}
            onEdit={handleOpenEditModal}
          />
        ),
      },
    ],
    [mutate, handleOpenEditModal]
  );

  return (
    <div className="flex flex-col gap-10">
      <AddEditForm
        open={openAddEditModal}
        onCancel={() => setOpenAddEditModal(false)}
        reloadChallenges={mutate}
        editMode={!!challengeWillBeEdited}
        data={challengeWillBeEdited}
      />

      <div className="flex items-start justify-between">
        <div className="flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Challenges
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            List all of the challenges
          </p>
        </div>

        <Button size="small" onClick={handleOpenAddNewModal}>
          <PlusIcon className="w-5 h-5" /> Add challenge
        </Button>
      </div>

      <Table
        columns={columns}
        data={challengeList}
        loading={isLoading || isValidating}
      />
    </div>
  );
}
