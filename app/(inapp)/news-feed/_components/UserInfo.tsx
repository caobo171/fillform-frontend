import React from 'react';
import { GoDotFill } from 'react-icons/go';

import Avatar from '@/components/ui/Avatar';
import { useUserStats } from '@/hooks/user';
import { Helper } from '@/services/Helper';
import { RawUser } from '@/store/types';

export function UserInfo({ data }: { data: RawUser }) {
  const { data: stats, isLoading } = useUserStats(data?.id);

  if (isLoading) {
    return <div className="h-[154px] animate-pulse bg-gray-200 rounded-lg" />;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex gap-3 mb-4">
        <Avatar user={data} size={48} />

        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-gray-900">
            {data?.fullname}
          </span>

          <span className="text-xs text-gray-500">@{data?.username}</span>
        </div>
      </div>

      <div className="flex items-center justify-between rounded bg-gray-50 p-2">
        <div className="flex flex-col items-center">
          <p className="font-medium text-base">
            {Helper.formatNumber(stats?.num_submits || 0)}
          </p>
          <p className="text-xs text-gray-500">Podcasts</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-medium text-baseb">
            {Helper.formatNumber(stats?.listened_words || 0)}
          </p>
          <p className="text-xs text-gray-500">Listend words</p>
        </div>

        <div className="flex flex-col items-center">
          <p className="font-medium text-base">
            {Helper.formatNumber(stats?.num_action_logs || 0)}
          </p>
          <p className="text-xs text-gray-500">Activities</p>
        </div>
      </div>
    </div>
  );
}
