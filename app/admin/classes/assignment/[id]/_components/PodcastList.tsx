import { MinusCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { ClassApi } from '@/app/admin/classes/classApi';
import { AutoComplete, Modal, Table, TableProps } from '@/components/common';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast } from '@/store/types';

type PodcastListProps = {
  assignment: AnyObject;
  isOverdue: boolean;
  reloadAssignment: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function PodcastList({
  assignment,
  isOverdue,
  reloadAssignment,
}: PodcastListProps) {
  const podcastListRef = useRef<RawPodcast[]>([]);

  const [podcastWillBeRemoved, setPodcastWillBeRemoved] =
    useState<RawPodcast>();

  const [showSearchPodcastInput, setShowSearchPodcastInput] =
    useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const { trigger: addPodcast } = useSWRMutation(
    ClassApi.AssignmentAddPodcast,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: removePodcast, isMutating: removingPodcast } =
    useSWRMutation(
      ClassApi.AssignmentRemovePodcast,
      Fetch.postFetcher.bind(Fetch)
    );

  const getPodcasts = useCallback(async (searchString: string) => {
    const result: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/podcasts/search',
      {
        q: searchString,
      }
    );

    if (!result?.data?.podcasts) {
      return Promise.resolve([]);
    }

    // save the last search result
    podcastListRef.current = result.data.podcasts;

    const podcastList = result.data.podcasts.map((pod: RawPodcast) => ({
      value: pod.id,
      label: (
        <div className="flex gap-2 items-center">
          <div
            className="w-6 h-6 rounded bg-cover bg-center"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL}${pod.image_url})`,
            }}
          />
          <span className="flex-1">{pod.name}</span>
        </div>
      ),
    }));

    return Promise.resolve(podcastList);
  }, []);

  const handleAddPodcast = useCallback(
    async (value: number) => {
      const podcastList = assignment?.podcasts ?? [];

      const isAlreadyInAssignment = !!podcastList.find(
        (s: { user_id: number }) => s.user_id === value
      );

      if (!isAlreadyInAssignment) {
        setLoading(true);

        const assignmentId = assignment?.id;

        const res: AnyObject = await addPodcast({
          payload: {
            id: assignmentId,
            podcasts: JSON.stringify([{ podcast_id: value }]),
          },
        });

        if (res?.data?.code === Code.Error) {
          toast.error(res?.data?.message);
        } else {
          toast.success('New podcast has been added');

          await reloadAssignment();
        }

        setLoading(false);
      } else {
        toast.warning('Podcast already in the assignment');
      }
    },
    [addPodcast, assignment?.id, assignment?.podcasts, reloadAssignment]
  );

  const handleRemovePodcast = useCallback(async () => {
    setLoading(true);

    const assignmentId = assignment?.id;

    const podcastId = podcastWillBeRemoved?.id;

    const res: AnyObject = await removePodcast({
      payload: { id: assignmentId, podcast_id: podcastId },
    });

    if (res?.data?.code === Code.Error) {
      toast.error('Something went wrong');
    } else {
      setPodcastWillBeRemoved(undefined);

      toast.success('Removed successfully');

      await reloadAssignment();
    }

    setLoading(false);
  }, [
    assignment?.id,
    podcastWillBeRemoved?.id,
    reloadAssignment,
    removePodcast,
  ]);

  const columnsPodcast: TableProps<RawPodcast>['columns'] = useMemo(
    () => [
      {
        title: 'Name',
        key: 'image_url',
        className: 'min-w-[200px]',
        render: (data: RawPodcast) => (
          <div className="flex gap-2 items-center">
            <div
              className="w-8 h-8 ring-2 ring-gray-100 bg-cover bg-center rounded"
              style={{
                backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
              }}
            />
            <span>{data.name}</span>
          </div>
        ),
      },
      {
        title: 'Narrator',
        key: 'narrator',
        dataIndex: 'narrator',
      },
      {
        title: 'Action',
        key: 'action',
        className: 'w-[120px]',
        render: (data: RawPodcast) => (
          <div className="flex gap-3">
            <MinusCircleIcon
              title="Remove"
              className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
              onClick={() => setPodcastWillBeRemoved(data)}
            />
          </div>
        ),
      },
    ],
    []
  );

  return (
    <>
      <Modal
        open={!!podcastWillBeRemoved}
        onCancel={() => setPodcastWillBeRemoved(undefined)}
        title="Confirm remove podcast"
        onOk={handleRemovePodcast}
        okButtonProps={{ loading: removingPodcast }}
        okText="Remove"
      >
        <p className="text-sm text-gray-900 py-4">
          Are you sure want to remove&nbsp;
          <span className="text-primary">{podcastWillBeRemoved?.name}</span>?
        </p>
      </Modal>
      <div className="flex flex-col gap-3 text-sm text-gray-900">
        <div className="flex justify-between items-end gap-4">
          <h3 className="font-semibold flex-1">
            Podcasts ({assignment.release_podcasts?.length})
          </h3>

          {showSearchPodcastInput && (
            <AutoComplete
              onFetch={getPodcasts}
              onSelect={(value) => handleAddPodcast(Number(value))}
              inputClassName="py-1"
              placeholder="Search podcast to add"
            />
          )}

          {!isOverdue && (
            <div
              className="outline-none bg-primary rounded-full w-7 h-7 flex items-center justify-center cursor-pointer hover:bg-primary-900"
              onClick={() => setShowSearchPodcastInput(true)}
              aria-hidden="true"
              title="Add podcast"
            >
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
          )}
        </div>

        <Table
          columns={columnsPodcast}
          data={assignment.release_podcasts ?? []}
          loading={loading}
        />
      </div>
    </>
  );
}
