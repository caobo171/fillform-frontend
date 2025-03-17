'use client';

import moment from 'moment';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import Avatar from '@/components/ui/Avatar';
import { Helper } from '@/services/Helper';
import { RawUserStats } from '@/store/types';

type UserInfoProps = {
  data?: RawUserStats;
  className?: string;
  minimal?: boolean;
};

export function UserInfo(props: UserInfoProps) {
  const { className, minimal, data = {} as RawUserStats } = props;

  const { user } = data;

  return (
    <div
      className={twMerge(
        'rounded-lg bg-white p-6 flex flex-col items-center',
        className
      )}
    >
      <div className="w-[100px] h-[100px] rounded-full ring-4 ring-gray-100 flex justify-center items-center mb-4">
        <Avatar user={user} unlink size={100} textClassName="text-5xl" />
      </div>

      <div className="text-center mb-4">
        <p className="text-xl font-medium text-gray-900">{user?.fullname}</p>

        <p className="flex-1 text-sm text-gray-600">({user?.username})</p>
      </div>

      <p className="text-sm text-gray-900 flex gap-2 items-center mb-4">
        Địa chỉ:&nbsp;
        {user?.city || 'Không xác định'}
      </p>

      {!minimal && (
        <p className="text-sm text-gray-900 text-center">
          Tham gia từ {moment((user?.since ?? 0) * 1000).format('DD/MM/YYYY')},
          hoạt động&nbsp;
          {Helper.convertFromNowToVNText(
            moment((data?.latest_active_time ?? 0) * 1000).fromNow()
          )}
        </p>
      )}

      {!minimal && user.description && (
        <p className="text-sm text-gray-600 text-center mt-4 italic">
          {user.description}
        </p>
      )}
    </div>
  );
}
