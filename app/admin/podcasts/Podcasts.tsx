'use client';

import {
  DocumentCheckIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
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
import Constants, { Code, PODCAST_STATUS } from '@/core/Constants';
import { useQueryString } from '@/hooks/useQueryString';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast } from '@/store/types';

type ResponseType = {
  podcasts: RawPodcast[];
  podcast_num: number;
  code: number;
};

export function Podcasts() {
  const router = useRouter();

  const pathname = usePathname();

  const { createQueryString } = useQueryString();

  const searchParams = useSearchParams();

  const pageSize = 12;

  const [currentPage, setCurrentPage] = useState<number>(() =>
    Number(searchParams.get('page') ?? 1)
  );

  const [deletePodcast, setDeletePodcast] = useState<RawPodcast>();

  const [reviewPodcast, setReviewPodcast] = useState<RawPodcast>();

  const [uuid, setUuid] = useState<string>();

  const [submittingReview, setSubmittingReview] = useState<number>(-1);

  const { trigger: doDelete, isMutating: deleting } = useSWRMutation(
    '/api/podcasts/remove',
    Fetch.postFetcher.bind(Fetch)
  );

  const podcastListState = useAsync(async () => {
    const res = await Fetch.postWithAccessToken<ResponseType>(
      '/api/podcasts/list.admin',
      {
        page: currentPage,
        page_size: pageSize,
        q: searchParams.get('q') || '',
      }
    );

    return {
      podcasts: res?.data?.podcasts ?? [],
      podcast_num: res?.data?.podcast_num ?? 0,
    };
  }, [currentPage, uuid, searchParams.toString()]);

  const { value: podcastDetail } = useAsync(async () => {
    if (!reviewPodcast) {
      return {};
    }

    const res = await Fetch.postWithAccessToken<{ podcast: RawPodcast }>(
      '/api/podcasts/detail',
      {
        id: reviewPodcast?.id,
      }
    );

    return {
      podcast: res?.data?.podcast ?? {},
    };
  }, [reviewPodcast?.id]);

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

  const handleApprove = async (status: number) => {
    setSubmittingReview(status);

    try {
      const result: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
        '/api/podcasts/update.status',
        {
          id: reviewPodcast?.id,
          status,
        }
      );

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        setReviewPodcast(undefined);

        setUuid(uuidv4());

        toast.success('Podcast status updated!');
      }
    } catch (e) {
      toast.error('Server error');
    }

    setSubmittingReview(-1);
  };

  const columns: TableProps<RawPodcast>['columns'] = [
    {
      title: 'Id',
      key: 'id',
      dataIndex: 'id',
      className: 'w-16',
    },
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
      title: 'Version',
      key: 'version',
      dataIndex: 'version',
      render: (data: RawPodcast) =>
        `${data.version >= 2 ? 'V2' : ''} - ${data.has_transcript == 1 ? 'Transcripted' : ''}`,
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
          return (
            <Badge type="yellow" className="w-[120px]">
              Waiting for review
            </Badge>
          );
        }

        if (data.status === 0) {
          return <Badge type="red">Inactive</Badge>;
        }

        if (data.status === 3) {
          return (
            <Badge type="orange" className="line-through">
              Declined
            </Badge>
          );
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
            onClick={() => router.push(`/admin/podcasts/edit/${data.id}`)}
          />

          {data.status === 2 && data.private === 0 && (
            <DocumentCheckIcon
              title="Review"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setReviewPodcast(data)}
            />
          )}
        </div>
      ),
    },
  ];

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

      <Modal
        open={!!reviewPodcast}
        onCancel={() => setReviewPodcast(undefined)}
        title="Review podcast"
        width="560px"
        footer={
          <div className="mt-4 flex justify-end items-center gap-2">
            <Button
              type="text"
              size="small"
              onClick={() => setReviewPodcast(undefined)}
            >
              Cancel
            </Button>

            <Button
              type="outline"
              size="small"
              onClick={() => handleApprove(PODCAST_STATUS.DECLINED)}
              disabled={submittingReview !== -1}
              loading={submittingReview === PODCAST_STATUS.DECLINED}
            >
              Decline
            </Button>

            <Button
              type="solid"
              size="small"
              onClick={() => handleApprove(PODCAST_STATUS.ACTIVE)}
              disabled={submittingReview !== -1}
              loading={submittingReview === PODCAST_STATUS.ACTIVE}
            >
              Approve
            </Button>
          </div>
        }
      >
        <div className="py-4 text-sm text-gray-900 flex flex-col gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
          <p>
            <strong>Name: </strong>
            {podcastDetail?.podcast?.name}
          </p>

          <p>
            <strong>Podcast Code: </strong>
            {podcastDetail?.podcast?.sub_name}
          </p>

          <div className="flex gap-4 justify-between items-end my-4">
            <p>
              <img
                src={`${Constants.IMAGE_URL}${podcastDetail?.podcast?.image_url}`}
                alt=""
                className="h-[100px] w-auto rounded-md"
              />
            </p>

            <p>
              <audio
                controls
                src={`${Constants.IMAGE_URL}${podcastDetail?.podcast?.file_path}`}
              />
            </p>
          </div>

          <p>
            <strong>Result: </strong>
            {podcastDetail?.podcast?.result}
          </p>

          <p>
            <strong>Description: </strong>
            <p
              dangerouslySetInnerHTML={{
                __html: podcastDetail?.podcast?.description ?? '',
              }}
            />
          </p>
        </div>
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
            onClick={() => router.push('/admin/podcasts/create')}
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
