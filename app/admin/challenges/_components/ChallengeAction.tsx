import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  ArrowTopRightOnSquareIcon,
  EllipsisVerticalIcon,
  LockClosedIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import React, { useCallback, useMemo, useState } from 'react';
import { CSVLink } from 'react-csv';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';
import { twMerge } from 'tailwind-merge';

import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { useExport } from '@/app/admin/challenges/_components/Export';
import { ChallengeApi } from '@/app/admin/challenges/challengeApi';
import {
  Button,
  Dropdown,
  DropdownProps,
  Loading,
  Modal,
  Switch,
} from '@/components/common';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { useRouter } from 'next/navigation';
import { Challenge } from '@/modules/challenge/challenge';

type ChallengeActionProps = {
  data: RawChallenge;
  className?: string;
  onEdit: (data: RawChallenge) => void;
  reloadChallenges: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function ChallengeAction(props: ChallengeActionProps) {
  const { className, data, reloadChallenges, onEdit } = props;

  const [exportId, setExportId] = useState<number | undefined>();
  const router = useRouter();

  const { loading: preparingExportData, csvData } = useExport(exportId);

  const { trigger: changeStatus, isMutating: isChangingStatus } =
    useSWRMutation(ChallengeApi.UpdateStatus, Fetch.postFetcher.bind(Fetch));

  const { trigger: finish } = useSWRMutation(
    ChallengeApi.Finish,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: triggerDelete, isMutating: isDeleting } = useSWRMutation(
    ChallengeApi.Delete,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: triggerSyncResult, isMutating: isSyncingResult } = useSWRMutation(
    ChallengeApi.SyncResult,
    Fetch.postFetcher.bind(Fetch)
  );


  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);
  const [openSyncModal, setOpenSyncModal] = useState<boolean>(false);

  const handleDelete = useCallback(async () => {
    const result: AnyObject = await triggerDelete({ payload: { id: data.id } });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      toast.success(`Deleted ${data.name}`);

      setOpenDeleteModal(false);

      reloadChallenges();
    }
  }, [data.id, data.name, reloadChallenges, triggerDelete]);

  const toggleActive = useCallback(
    async (val: boolean) => {
      const result: AnyObject = await changeStatus({
        payload: { id: data.id, is_public: val },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        toast.success(`${val ? 'Activated' : 'Deactivated'} ${data.name}`);

        reloadChallenges();
      }
    },
    [changeStatus, data.id, data.name, reloadChallenges]
  );

  const setFinish = useCallback(async () => {
    const result: AnyObject = await finish({
      payload: {
        challenge_id: data.id,
        status: Constants.CHALLENGE.FINISHED,
      },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      toast.success(`Finished ${data.name}`);

      reloadChallenges();
    }
  }, [data.id, data.name, finish, reloadChallenges]);

  console.log('csvData = ', csvData);


  const syncResult = useCallback(async () => {

    const result: AnyObject = await triggerSyncResult({ payload: { challenge_id: data.id } });
    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      toast.success(`Result synced ${data.name}`);
    }

  }, [data.id]);


  const options: DropdownProps['options'] = useMemo(
    () => [
      {
        label: (
          //@ts-ignore
          <CSVLink
            data={csvData}
            filename={`challenge_${data.id}.csv`}
            className="w-full"
          >
            <span className="flex items-center gap-2 text-gray-900 p-2">
              <ArrowDownTrayIcon className="w-5 h-5" />
              {preparingExportData ? 'Preparing...' : 'Export'}
            </span>
          </CSVLink>
        ),
        className: 'px-0 py-0',
        value: 'export',
      },
      {
        label: (
          <span className="flex items-center gap-2 text-gray-900">
            <ArrowTopRightOnSquareIcon className="w-5 h-5" /> Go to page
          </span>
        ),
        value: 'go_to_page',
        onClick: () => router.push(Challenge.getURL(data)),
      },
      {
        label: (
          <span className="flex items-center gap-2 text-gray-900">
            <PencilIcon className="w-5 h-5" /> Edit
          </span>
        ),
        value: 'edit',
        onClick: () => onEdit(data),
      },
      {
        label: (
          <span className="flex items-center gap-2 text-gray-900">
            <LockClosedIcon className="w-5 h-5" /> Finish
          </span>
        ),
        value: 'finish',
        onClick: () => setFinish(),
      },

      {
        label: (
          <span className="flex items-center gap-2 text-gray-900">
            <ArrowPathIcon className="w-5 h-5" /> Sync result
          </span>
        ),
        value: 'sync_result',
        onClick: () => setOpenSyncModal(true),
      },
      {
        label: (
          <span className="flex items-center gap-2 text-red-500">
            <TrashIcon className="w-5 h-5" /> Delete
          </span>
        ),
        value: 'remove',
        onClick: () => setOpenDeleteModal(true),
      },
    ],
    [csvData, data, onEdit, setFinish]
  );


  return (
    <div className="flex items-center gap-4">
      <Modal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        title="Confirm delete"
        width="560px"
        okText="Delete"
        onOk={handleDelete}
        okButtonProps={{ loading: isDeleting }}
      >
        <p className="py-4 text-sm text-gray-900">
          Are you sure that you want to delete challenge{' '}
          <span className="text-red-500 font-medium">{data.name}</span>?
        </p>
      </Modal>

      <Modal
        open={openSyncModal}
        onCancel={() => setOpenSyncModal(false)}
        title="Confirm sync"
        width="560px"
        okText="Sync"
        onOk={syncResult}
        okButtonProps={{ loading: isSyncingResult }}
      >
        <p className="py-4 text-sm text-gray-900">
          Are you sure that you want to sync result in challenge{' '}
          <span className="text-red-500 font-medium">{data.name}</span>?
        </p>
      </Modal>

      <Switch
        onChange={toggleActive}
        size="sm"
        value={data.is_public}
        disable={isChangingStatus}
      />

      <Dropdown
        options={options}
        className={twMerge('leading-[0px]', className)}
        popupClassName="left-0 min-w-[160px]"
      >
        <div
          aria-hidden="true"
          className="group w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
          onClick={() => setExportId(data.id)}
        >
          {isChangingStatus ? (
            <Loading className="text-primary" />
          ) : (
            <EllipsisVerticalIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
          )}
        </div>
      </Dropdown>
    </div>
  );
}
