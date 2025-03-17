'use client';

import { PencilIcon, PlayIcon, TrashIcon } from '@heroicons/react/24/outline';
import { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';
import { useContext, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { PlaylistForm } from '@/app/(inapp)/playlist/_components/PlaylistForm';
import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { getPlaylistThumb } from '@/app/(inapp)/playlist/playlistHelper';
import { Button, Modal } from '@/components/common';
import { QueueContext } from '@/contexts';
import { QueueAction } from '@/contexts/QueueContext';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawUserPlaylist } from '@/store/types';

type InfoProps = {
  data: RawUserPlaylist;
  allowToEdit?: boolean;
  reloadData?: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function Info({ data, allowToEdit, reloadData }: InfoProps) {
  const { setQueue } = useContext(QueueContext);

  const me = MeHook.useMe();

  const router = useRouter();

  const { trigger: triggerDelete, isMutating: isDeleting } = useSWRMutation(
    PlaylistAPI.Remove,
    Fetch.postFetcher.bind(Fetch)
  );

  const [openDeleteModal, setOpenDeleteModal] = useState<boolean>(false);

  const [openEditForm, setOpenEditForm] = useState<boolean>(false);

  const views = useMemo(() => {
    let result = 0;

    data?.podcasts?.forEach((item) => {
      result += item.views;
    });

    return result;
  }, [data]);

  console.log(data);

  const handleDelete = async () => {
    try {
      const result: AnyObject = await triggerDelete({
        payload: { id: data?.id },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result?.data?.message);
      } else {
        toast.success('Xóa playlist thành công');

        setOpenDeleteModal(false);

        router.push('/playlist');
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  const onEditSuccess = (msg: string) => {
    toast.success(msg);

    if (reloadData) {
      reloadData();
    }
  };

  const startPlaying = () => {
    setQueue({ type: QueueAction.UpdatePlaying, playing: data.podcasts[0] });
    setQueue({ type: QueueAction.UpdatePodcasts, podcasts: data?.podcasts });
  };

  return (
    <div className="flex gap-6">
      <Modal
        open={openDeleteModal}
        onCancel={() => setOpenDeleteModal(false)}
        title="Xác nhận xóa playlist"
        okText="Xóa"
        cancelText="Bỏ qua"
        onOk={handleDelete}
        okButtonProps={{ loading: isDeleting }}
      >
        <p className="text-sm text-gray-900 py-4">
          Bạn có chắc chắn muốn xóa playlist{' '}
          <span className="font-bold">{data?.name}</span>?
        </p>
      </Modal>

      <PlaylistForm
        open={openEditForm}
        onCancel={() => setOpenEditForm(false)}
        onSuccess={onEditSuccess}
        data={data}
        editMode
      />

      <div
        className="w-[224px] h-[224px] flex flex-wrap rounded-lg overflow-hidden bg-center bg-cover"
        style={{ backgroundImage: `url(${getPlaylistThumb(data)})` }}
      />

      <div className="flex-1 flex flex-col justify-between text-gray-900 text-sm">
        <div className="flex-1">
          <h3 className="text-2xl text-gray-900 font-medium mb-2">
            {data?.name}
          </h3>

          <p className="mb-6">{data?.description}</p>

          <div className="flex gap-2 mb-2 items-center">
            <span>{data?.privacy === 0 ? 'Công khai' : 'Chỉ mình tôi'}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{me?.fullname}</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{new Date((data?.since ?? 0) * 1000).getFullYear()}</span>
          </div>

          <div className="flex gap-2 items-center">
            <span>{Helper.formatNumber(views)} lượt nghe</span>
            <span className="w-1 h-1 rounded-full bg-gray-500" />
            <span>{data?.podcasts?.length} podcasts</span>
            {/* <span className="w-1 h-1 rounded-full bg-gray-500" /> */}
            {/* <span>25 phút</span> */}
          </div>
        </div>

        <div className="flex gap-4 mb-[2px]">
          <Button
            type="solid"
            size="large"
            title="Bắt đầu nghe"
            className="ring-0 px-2.5 rounded-full"
            onClick={startPlaying}
          >
            <PlayIcon className="w-5 h-5 text-white" />
          </Button>

          {allowToEdit && (
            <>
              <Button
                type="outline"
                size="large"
                title="Chỉnh sửa"
                className="ring-0 bg-gray-150 px-2.5 rounded-full hover:bg-gray-200"
                onClick={() => setOpenEditForm(true)}
              >
                <PencilIcon className="w-5 h-5 text-gray-900" />
              </Button>

              <Button
                type="outline"
                size="large"
                title="Xóa"
                className="ring-0 bg-gray-150 px-2.5 rounded-full hover:bg-gray-200"
                onClick={() => setOpenDeleteModal(true)}
              >
                <TrashIcon className="w-5 h-5 text-gray-900" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
