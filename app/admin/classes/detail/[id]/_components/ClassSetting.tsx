import {
  Cog6ToothIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import { debounce } from 'lodash';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';
import { twMerge } from 'tailwind-merge';

import { Button, Checkbox, Input, Modal } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawWeleClass } from '@/store/types';

type ClassSettingProps = {
  data?: RawWeleClass;
  reFetchClass: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function ClassSetting(props: ClassSettingProps) {
  const { data, reFetchClass } = props;

  const { trigger: updatePublic } = useSWRMutation(
    '/api/wele.class/make.public',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger } = useSWRMutation(
    '/api/wele.class/update/setting',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: generateLink, isMutating: generating } = useSWRMutation(
    '/api/wele.class/generate.link.token',
    Fetch.postFetcher.bind(Fetch)
  );

  const timeRef = useRef<HTMLInputElement>(null);

  const feeRef = useRef<HTMLInputElement>(null);

  const [openModal, setOpenModal] = useState<boolean>(false);

  const [link, setLink] = useState<string>('');

  const getFullLink = useCallback((token: string) => {
    const { origin } = window.location;

    return `${origin}/classes/join?token=${token}`;
  }, []);

  const handleChangeSetting = useCallback(
    async (value: boolean) => {
      const result: AnyObject = await trigger({
        payload: { id: data?.id, show_expired_podcasts: value ? 1 : 0 },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        toast.success('Settings updated!');

        reFetchClass();
      }
    },
    [data?.id, reFetchClass, trigger]
  );

  const handlePublicClass = useCallback(
    async (value: boolean) => {
      const result: AnyObject = await updatePublic({
        payload: {
          class_id: data?.id,
          is_public: value,
          lost_coin: feeRef?.current?.value || 0,
        },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        toast.success('Settings updated!');

        reFetchClass();
      }
    },
    [data, reFetchClass, updatePublic]
  );

  const handleGenerateLink = useCallback(async () => {
    const expiredTime = timeRef?.current?.value
      ? new Date(timeRef?.current?.value).getTime() / 1000
      : undefined;

    const result: AnyObject = await generateLink({
      payload: { id: data?.id, expired_time: expiredTime },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      setLink(getFullLink(result?.data?.token));
    }
  }, [data?.id, generateLink, getFullLink]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(link);

    toast.success('Copied');
  }, [link]);

  const updateSubFee = useCallback(async () => {
    if (feeRef?.current?.value !== data?.lost_coin) {
      await handlePublicClass(!!data?.is_public);
    }
  }, [data, handlePublicClass]);

  useEffect(() => {
    if (data?.data?.token) {
      setLink(getFullLink(data.data.token));
    }
  }, [data, getFullLink]);

  return (
    <>
      <Cog6ToothIcon
        className="w-5 h-5 text-gray-500 hover:text-gray-900 cursor-pointer"
        onClick={() => setOpenModal(true)}
      />

      <Modal
        width="560px"
        title="Class settings"
        open={openModal}
        onCancel={() => setOpenModal(false)}
        onOk={() => setOpenModal(false)}
        cancelButtonProps={{ className: 'hidden' }}
      >
        <div className="py-4 text-sm">
          <div className="flex flex-col gap-4 mb-6 px-2 py-4 rounded-lg bg-gray-50">
            <Checkbox
              value={data?.data?.settings?.show_expired_podcasts === 1}
              className="items-start gap-3"
              onChange={handleChangeSetting}
            >
              <div className="flex-1 flex flex-col gap-1 mt-[-4px]">
                <p className="text-gray-900 font-medium">
                  Show overdue assignments
                </p>
                <p className="text-gray-500">
                  By enable this setting, your students in this class will able
                  to see and do the overdue assignments.
                </p>
              </div>
            </Checkbox>
          </div>

          {/* <div className="flex flex-col gap-4 mb-6 px-2 py-4 rounded-lg bg-gray-50">
            <Checkbox
              value={data?.is_public}
              className="items-start gap-3"
              onChange={handlePublicClass}
            >
              <div className="flex-1 flex flex-col gap-1 mt-[-4px]">
                <p className="text-gray-900 font-medium">Make class Public</p>

                <p className="text-gray-500">
                  Set public will make class visible to all students, so
                  everyone can join your class. You can set a join fee below.
                </p>
              </div>
            </Checkbox>

            <div className="flex flex-col gap-2 pl-7">
              <p className="text-gray-500">
                This is the subscription fee. Everyone has to pay monthly to
                maintain class (only apply for Public class).
              </p>

              <Input
                ref={feeRef}
                placeholder="Example: 40"
                type="number"
                defaultValue={data?.lost_coin}
                onChange={debounce(updateSubFee, 300)}
              />
            </div>
          </div> */}

          <div className="rounded-lg px-2 py-4 bg-gray-50">
            <p className="text-gray-900 font-medium mb-1">
              Generate auto join link
            </p>

            <p className="text-gray-500 mb-4">
              Share the link to students who you want to invite to your class
            </p>

            <div className="flex gap-2 items-center mb-3">
              <span>Link will be expired on</span>
              <Input
                className="w-[156px]"
                size="small"
                type="date"
                placeholder="Expire time"
                ref={timeRef}
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="small"
                type="secondary"
                loading={generating}
                onClick={handleGenerateLink}
              >
                Generate
              </Button>

              <div className="relative flex-1">
                <Input size="small" value={link} readOnly className="pr-10" />

                <div
                  aria-hidden="true"
                  title="Copy"
                  onClick={handleCopyLink}
                  className={twMerge(
                    'absolute z-1 right-0 top-0 h-[32px] w-[40px] flex items-center justify-center',
                    'bg-gray-500 border-[1px] border-gray-500 rounded-r-md hover:bg-gray-700 cursor-pointer'
                  )}
                >
                  <DocumentDuplicateIcon className="w-5 h-5 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
