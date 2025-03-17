import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { PlaylistForm } from '@/app/(inapp)/playlist/_components/PlaylistForm';
import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { getPlaylistThumb } from '@/app/(inapp)/playlist/playlistHelper';
import { usePlaylists } from '@/app/(inapp)/playlist/playlistHooks';
import { Button, Checkbox, Modal, ModalProps } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawPodcast, RawUserPlaylist } from '@/store/types';

type PlaylistModalProps = {
  podcast?: RawPodcast;
} & Omit<ModalProps, 'title' | 'okButtonProps' | 'onOk'>;

export function PlaylistModal(props: PlaylistModalProps) {
  const { open, podcast, onCancel } = props;

  const [openForm, setOpenForm] = useState<boolean>(false);

  const { trigger: add } = useSWRMutation(
    PlaylistAPI.AddPodcast,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: remove } = useSWRMutation(
    PlaylistAPI.RemovePodcast,
    Fetch.postFetcher.bind(Fetch)
  );

  const { data, mutate } = usePlaylists();

  const isInPlaylist = useCallback(
    (playlistItem: RawUserPlaylist) => {
      if (!playlistItem?.podcasts) {
        return false;
      }

      return !!playlistItem.podcasts.find((item) => item.id === podcast?.id);
    },
    [podcast]
  );

  const onAddNewPlaylist = (msg: string) => {
    toast.success(msg);

    // reload playlists
    mutate();
  };

  const handleCheckboxChange = async (
    checked: boolean,
    playlistItem: RawUserPlaylist
  ) => {
    try {
      if (checked) {
        const result: AnyObject = await add({
          payload: { id: playlistItem?.id, podcast_id: podcast?.id },
        });

        if (result?.data?.code === Code.Error) {
          toast.error(result?.data?.message);
        } else {
          toast.success(`Đã thêm vào ${playlistItem?.name}`);

          mutate();
        }
      } else {
        const result: AnyObject = await remove({
          payload: { id: playlistItem?.id, podcast_id: podcast?.id },
        });

        if (result?.data?.code === Code.Error) {
          toast.error(result?.data?.message);
        } else {
          toast.success(`Đã xóa khỏi ${playlistItem?.name}`);

          mutate();
        }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra');
    }
  };

  return (
    <Modal
      title="Thêm vào playlist"
      open={open}
      onCancel={onCancel}
      okButtonProps={{ className: 'hidden' }}
      cancelButtonProps={{ className: 'hidden' }}
      panelClassName="pl-0 pr-0"
      headerClassName="px-6"
      footer={<div />}
    >
      <PlaylistForm
        open={openForm}
        onCancel={() => setOpenForm(false)}
        onSuccess={onAddNewPlaylist}
      />

      <div className="pt-4">
        <div className="max-h-[70vh] overflow-y-auto overflow-x-hidden custom-scrollbar">
          <div className="flex flex-col gap-6 px-6">
            {data.map((item) => (
              <div
                key={item.id}
                className="flex items-center text-sm text-gray-900"
              >
                <div className="flex-1 flex gap-3">
                  <div
                    className="w-10 h-10 bg-cover bg-center rounded"
                    style={{
                      backgroundImage: `url(${getPlaylistThumb(item)})`,
                    }}
                  />

                  <div className="flex flex-col justify-between">
                    {item.name}{' '}
                    <span className="text-xs text-gray-500">
                      {item?.podcasts?.length} podcasts
                    </span>
                  </div>
                </div>

                <Checkbox
                  onChange={(checked: boolean) =>
                    handleCheckboxChange(checked, item)
                  }
                  value={isInPlaylist(item)}
                >
                  {null}
                </Checkbox>
              </div>
            ))}
          </div>
        </div>

        <Button
          type="outline"
          className="mt-8 mx-6"
          size="small"
          onClick={() => setOpenForm(true)}
        >
          <PlusIcon className="w-5 h-5 text-primary" />
          Tạo playlist mới
        </Button>
      </div>
    </Modal>
  );
}
