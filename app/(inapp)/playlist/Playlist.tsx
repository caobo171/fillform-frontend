'use client';

import { PlusIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { PremiumWarning } from '@/app/(inapp)/_components/PremiumWarning';
import { PlaylistForm } from '@/app/(inapp)/playlist/_components/PlaylistForm';
import { PlaylistItem } from '@/app/(inapp)/playlist/_components/PlaylistItem';
import { PlaylistSkeleton } from '@/app/(inapp)/playlist/_components/PlaylistSkeleton';
import {
  usePlaylists,
  usePublicPlaylists,
} from '@/app/(inapp)/playlist/playlistHooks';
import { Button } from '@/components/common';
import { Helper } from '@/services/Helper';
import { MeHook } from '@/store/me/hooks';
import { RawUserPlaylist } from '@/store/types';

export function Playlist() {
  const { data, mutate, isLoading } = usePlaylists();

  const { data: publicList } = usePublicPlaylists();

  const sub = MeHook.useSubscription();

  const isPremiumUser = useMemo(() => Helper.isPremiumUser(sub), [sub]);

  const [openAddModal, setOpenAddModal] = useState(false);

  const onAddSuccess = (msg: string) => {
    toast.success(msg);

    // refresh playlists
    mutate();
  };

  if (isLoading) {
    return <PlaylistSkeleton />;
  }

  if (!isPremiumUser) {
    return <PremiumWarning />;
  }

  return (
    <div className="flex flex-col gap-10">
      <PlaylistForm
        open={openAddModal}
        onCancel={() => setOpenAddModal(false)}
        onSuccess={onAddSuccess}
      />

      <div className="flex flex-col gap-10">
        <div className="flex items-start">
          <div className="flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Playlist của bạn ({data?.length})
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Danh sách các playlist hiện tại của bạn
            </p>
          </div>

          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button size="small" onClick={() => setOpenAddModal(true)}>
              <PlusIcon className="w-5 h-5 text-white" />
              Tạo playlist mới
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          {data?.map((item: RawUserPlaylist) => (
            <PlaylistItem data={item} key={item.id} />
          ))}
        </div>
      </div>

      <div className="w-full h-[1px] bg-gray-100" />

      <div className="flex flex-col gap-8">
        <div className="flex items-start">
          <div className="flex-auto">
            <h3 className="text-base font-semibold leading-6 text-gray-900">
              Gọi ý cho bạn
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Danh sách các playlist đang được nghe nhiều nhất
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-8">
          {publicList?.map((item: RawUserPlaylist) => (
            <PlaylistItem data={item} key={item.id} isPublic />
          ))}
        </div>
      </div>
    </div>
  );
}
