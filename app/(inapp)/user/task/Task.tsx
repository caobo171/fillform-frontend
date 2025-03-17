'use client';

import { ShareIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';

import { SocialShare } from '@/app/(inapp)/user/task/SocialShare';
import { TaskBox } from '@/app/(inapp)/user/task/_components/TaskBox';
import {
  UserInvite
} from '@/app/(inapp)/user/task/_components/UserInvite';

export function Task() {
  const [openSocialShare, setOpenShareSocialShare] = useState<boolean>(false);
  const [openUserInvite, setOpenUserInvite] = useState<boolean>(false);

  return (
    <div className="flex-1 flex flex-col">
      <SocialShare
        open={openSocialShare}
        onCancel={() => setOpenShareSocialShare(false)}
      />

      <UserInvite
        open={openUserInvite}
        onCancel={() => setOpenUserInvite(false)}
      />

      <div className="mb-8">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Nhiệm vụ kiếm coin
        </h1>

        <p className="mt-2 text-sm text-gray-700">
          Bạn có thể kiếm được rất nhiều coin từ những nhiệm vụ của WELE.
        </p>
      </div>

      <div className="flex flex-wrap gap-6">
        <TaskBox
          icon={<ShareIcon className="w-6 h-6 text-red-500" />}
          title="Chia sẻ WELE trên mạng xã hội"
          coin={50}
          onClick={() => setOpenShareSocialShare(true)}
        />
        <TaskBox
          icon={<ShareIcon className="w-6 h-6 text-red-500" />}
          title="Giới thiệu WELE với bạn bè"
          coin={10}
          onClick={() => setOpenUserInvite(true)}
        />
      </div>
    </div>
  );
}
