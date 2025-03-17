'use client';

import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAsync } from 'react-use';
import useSWRMutation from 'swr/mutation';
import { v4 as uuidv4 } from 'uuid';

import {
  Badge,
  Button,
  Modal,
  Pagination,
  Table,
  TableProps,
} from '@/components/common';
import Constants, { Code } from '@/core/Constants';
import { useQueryString } from '@/hooks/useQueryString';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { ExtraPageProps, RawPodcast } from '@/store/types';
import { MeHook } from '@/store/me/hooks';
import ACL from '@/services/ACL';
import { useMe } from '@/hooks/user';
import { PremiumPaidWarning } from '@/app/(inapp)/_components/PremiumWarning';

type ResponseType = {
  podcasts: RawPodcast[];
  podcast_num: number;
  code: number;
};

export function Podcasts({ routerGroup }: ExtraPageProps) {
  const router = useRouter();

  const pathname = usePathname();

  const sub = MeHook.useSubscription();
  const user = useMe();

  const { createQueryString } = useQueryString();

  const searchParams = useSearchParams();

  const pageSize = 12;

  const [currentPage, setCurrentPage] = useState<number>(() =>
    Number(searchParams.get('page') ?? 1)
  );

  const [deletePodcast, setDeletePodcast] = useState<RawPodcast>();

  const [uuid, setUuid] = useState<string>();

  const { trigger: doDelete, isMutating: deleting } = useSWRMutation(
    '/api/podcasts/remove',
    Fetch.postFetcher.bind(Fetch)
  );

  const podcastListState = useAsync(async () => {
    const res = await Fetch.postWithAccessToken<ResponseType>(
      '/api/podcasts/list.admin',
      {
        page: currentPage,
        page_size: 12,
      }
    );

    return {
      podcasts: res?.data?.podcasts ?? [],
      podcast_num: res?.data?.podcast_num ?? 0,
    };
  }, [currentPage, uuid]);

  const onPageChange = (value: number) => {
    setCurrentPage(value);

    router.push(`${pathname}?${createQueryString('page', String(value))}`);
  };

  const handleDelete = async () => {
    const result: AnyObject = await doDelete({
      payload: { id: deletePodcast?.id },
    });

    if (result?.data?.code !== Code.Error) {
      setDeletePodcast(undefined);

      setUuid(uuidv4());

      toast.success('Delete successfully!');
    } else {
      toast.error(result?.data?.message);
    }
  };

  const columns: TableProps<RawPodcast>['columns'] = [
    {
      title: 'Image',
      key: 'image_url',
      className: 'w-16',
      render: (data: RawPodcast) => (
        <div className="w-8 h-8 overflow-hidden rounded inline-flex justify-center leading-none">
          <img
            src={`${Constants.IMAGE_URL}${data.image_url}`}
            alt={data.name}
            className="h-full w-auto max-w-none"
          />
        </div>
      ),
    },
    {
      title: 'Name',
      key: 'name',
      dataIndex: 'name',
      className: 'max-w-[300px]',
    },
    {
      title: 'Podcast code',
      key: 'sub_name',
      dataIndex: 'sub_name',
    },
    {
      title: 'Narrator',
      key: 'narrator',
      dataIndex: 'narrator',
    },
    {
      title: 'Private/Public',
      key: 'private',
      dataIndex: 'private',
      render: (data: RawPodcast) => (data.private === 1 ? 'Private' : 'Public'),
    },
    {
      title: 'Status',
      key: 'status',
      dataIndex: 'status',
      render: (data: RawPodcast) => {
        if (data.status === 2 && data.private === 0) {
          return <Badge type="yellow">Waiting for review</Badge>;
        }

        if (data.status === 0) {
          return <Badge type="red">Inactive</Badge>;
        }

        return <Badge type="green">Active</Badge>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (data: RawPodcast) => (
        <div className="flex gap-3">
          <TrashIcon
            title="Delete"
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() => setDeletePodcast(data)}
          />

          <PencilSquareIcon
            title="Edit"
            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
            onClick={() =>
              router.push(`/${routerGroup}/podcasts/edit/${data.id}`)
            }
          />
        </div>
      ),
    },
  ];

  if (!Number(sub?.is_paid_premium) && !ACL.isContentCreator(user.data) && !ACL.isTeacher(user.data)) {
    return <PremiumPaidWarning />;
  }

  return (
    <>
      <Modal
        open={!!deletePodcast}
        onCancel={() => setDeletePodcast(undefined)}
        onOk={() => handleDelete()}
        title="Confirm delete"
        okText="Delete"
        okButtonProps={{ loading: deleting }}
      >
        <p className="py-2 text-sm text-gray-500">
          Are you sure want to delete podcast{' '}
          {deletePodcast && (
            <span className="text-primary">
              {deletePodcast.name} ({deletePodcast.sub_name})
            </span>
          )}
          ?
        </p>
      </Modal>

      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Podcasts
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all the podcasts in your account.
          </p>
        </div>

        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Button
            size="small"
            onClick={() => router.push(`/${routerGroup}/podcasts/create`)}
          >
            Add podcast
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        data={podcastListState?.value?.podcasts ?? []}
        loading={podcastListState.loading}
      />

      {podcastListState.value &&
        podcastListState.value.podcast_num > pageSize && (
          <Pagination
            total={podcastListState.value?.podcast_num ?? 0}
            pageSize={pageSize}
            current={currentPage}
            className="mt-6"
            onChange={onPageChange}
          />
        )}
    </>
  );
}
