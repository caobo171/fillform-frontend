'use client';

import { CheckCircleIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { TaskApi } from '@/app/admin/task/taskApi';
import { useTasks } from '@/app/admin/task/taskHook';
import { RawSocialShare } from '@/app/admin/task/taskType';
import {
  Badge,
  Modal,
  Pagination,
  Select,
  Table,
  TableProps,
  TextArea,
} from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

const PageSize = 20;

const Status = {
  Waiting: 'WAITING_STATUS',
  Approved: 'APPROVED_STATUS',
  Rejected: 'REJECTED_STATUS',
};

const FilterOptions = [
  { label: 'All', value: '' },
  { label: 'Waiting for review', value: Status.Waiting },
  { label: 'Approved', value: Status.Approved },
  { label: 'Rejected', value: Status.Rejected },
];

export function Task() {
  const { trigger: update, isMutating: updating } = useSWRMutation(
    TaskApi.Update,
    Fetch.postFetcher.bind(Fetch)
  );

  const [page, setPage] = useState<number>(1);

  const [filterStatus, setFilterStatus] = useState<string>('');

  const rejectMessageRef = useRef<HTMLTextAreaElement>(null);

  const {
    data,
    isValidating,
    isLoading,
    mutate: reloadList,
  } = useTasks(page, PageSize, filterStatus);

  const [selectedRecord, setSelectedRecord] = useState<RawSocialShare>();

  const [imageView, setImageView] = useState<string>();

  const handleChangeStatus = useCallback(
    async (status: string, id?: number) => {
      const rejectMessage = rejectMessageRef.current?.value;

      const result: AnyObject = await update({
        payload: {
          id: id ?? selectedRecord?.id,
          status,
          reject_reason: rejectMessage,
        },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        setSelectedRecord(undefined);

        reloadList();
      }
    },
    [reloadList, selectedRecord?.id, update]
  );

  const setRejectMessage = useCallback((message: string) => {
    if (rejectMessageRef.current) {
      rejectMessageRef.current.value = message;
    }
  }, []);

  const columns: TableProps<RawSocialShare>['columns'] = useMemo(
    () => [
      {
        key: 'id',
        title: 'Id',
        dataIndex: 'id',
        className: 'w-6',
      },
      {
        key: 'user',
        title: 'User',
        dataIndex: 'user',
        render: (record: RawSocialShare) =>
          record.user && (
            <div className="flex items-center gap-2">
              <Avatar user={record.user} size={32} />
              <span className="text-sm text-gray-900">
                {record.user.fullname}
              </span>
            </div>
          ),
      },
      {
        key: 'public_link',
        title: 'Public link',
        dataIndex: 'public_link',
        render: (record: RawSocialShare) => (
          <a
            href={record.public_link}
            target="_blank"
            className="hover:text-gray-500"
          >
            View post
          </a>
        ),
      },
      {
        key: 'image_url',
        title: 'Image',
        dataIndex: 'image_url',
        render: (record: RawSocialShare) =>
          record?.image_url ? (
            <img
              src={`${Constants.IMAGE_URL}${record.image_url}`}
              alt="social share"
              className="h-14 cursor-zoom-in"
              aria-hidden="true"
              onClick={() => setImageView(record?.image_url ?? '')}
            />
          ) : (
            '---'
          ),
      },
      {
        key: 'reaction_total',
        title: 'Reaction total',
        dataIndex: 'reaction_total',
      },
      {
        key: 'reward_coin',
        title: 'Reward coin',
        dataIndex: 'reward_coin',
      },
      {
        key: 'create_at',
        title: 'Submit at',
        dataIndex: 'create_at',
        render: (record: RawSocialShare) => (
          <span>{new Date(record.create_at * 1000).toLocaleString()}</span>
        ),
      },
      {
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        render: (record: RawSocialShare) => {
          const { status } = record;

          if (status === Status.Waiting) {
            return <Badge type="yellow">Waiting for review</Badge>;
          }

          if (status === Status.Approved) {
            return <Badge type="green">Approved</Badge>;
          }

          if (status === Status.Rejected) {
            return (
              <Badge type="red" className="line-through">
                Rejected
              </Badge>
            );
          }

          return <Badge type="gray">Unknown</Badge>;
        },
      },
      {
        key: `action`,
        title: 'Action',
        className: 'w-[100px]',
        render: (record: RawSocialShare) => (
          <div className="flex items-center gap-3">
            {record.status !== Status.Rejected && (
              <NoSymbolIcon
                onClick={() => setSelectedRecord(record)}
                className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
                title="Reject"
              />
            )}

            {record.status === Status.Waiting && (
              <CheckCircleIcon
                onClick={() => handleChangeStatus(Status.Approved, record.id)}
                className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
                title="Approve"
              />
            )}
          </div>
        ),
      },
    ],
    [handleChangeStatus]
  );

  return (
    <div className="flex-1 flex flex-col">
      <Modal
        title={`Reject ${selectedRecord?.user?.fullname}'s submission`}
        width="560px"
        open={!!selectedRecord}
        onCancel={() => setSelectedRecord(undefined)}
        okText="Reject"
        okButtonProps={{ loading: updating }}
        onOk={() => handleChangeStatus(Status.Rejected)}
      >
        <div className="py-4">
          <TextArea
            ref={rejectMessageRef}
            placeholder={`Reason to reject (${selectedRecord?.reward_coin} coins will be recalled)`}
            className="mb-4"
          />

          <div className="text-sm text-gray-900">
            <p className="text-gray-500 mb-1">Click to select a reason</p>

            <div className="flex items-center gap-4">
              <span
                className="cursor-pointer underline"
                aria-hidden="true"
                onClick={() => setRejectMessage('Link không hợp lệ')}
              >
                Link không hợp lệ
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />

              <span
                className="cursor-pointer underline"
                aria-hidden="true"
                onClick={() => setRejectMessage('Số liệu không chính xác')}
              >
                Số liệu không chính xác
              </span>

              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />

              <span
                className="cursor-pointer underline"
                aria-hidden="true"
                onClick={() => setRejectMessage('Hình ảnh không hợp lệ')}
              >
                Hình ảnh không hợp lệ
              </span>
            </div>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!imageView}
        onCancel={() => setImageView(undefined)}
        cancelButtonProps={{ className: 'hidden' }}
        onOk={() => setImageView(undefined)}
        okText="Close"
        width="800px"
      >
        <img
          src={`${Constants.IMAGE_URL}${imageView}`}
          alt=""
          className="w-full"
        />
      </Modal>

      <div className="mb-6">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Task - Social share
        </h1>
      </div>

      <Select
        options={FilterOptions}
        value={filterStatus}
        onChange={(value) => setFilterStatus(String(value))}
        className="w-[180px] mb-4"
      />

      <Table
        data={data.list}
        columns={columns}
        loading={isLoading || isValidating || updating}
        className="mb-2"
      />

      <Pagination
        total={data.pagination.total}
        current={page}
        pageSize={PageSize}
        onChange={setPage}
      />
    </div>
  );
}
