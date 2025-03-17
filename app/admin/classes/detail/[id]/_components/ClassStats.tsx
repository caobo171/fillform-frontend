import {
  CheckBadgeIcon,
  ClockIcon,
  DocumentArrowUpIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import React from 'react';

import { Helper } from '@/services/Helper';
import { RawWeleClass } from '@/store/types';

export function ClassStats({ data }: { data?: RawWeleClass }) {
  return (
    <div className="flex flex-col gap-5">
      <h3 className="text-sm font-semibold">Overall performance</h3>

      <div className="flex gap-8">
        <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-emerald-100 text-emerald-600">
          <div className="w-14 h-14 rounded-lg bg-emerald-200 flex items-center justify-center">
            <DocumentArrowUpIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {data?.stats?.submits_num || 0}
            </span>
            <span className="text-sm">Total submissions</span>
          </div>
        </div>

        <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-orange-100 text-orange-600">
          <div className="w-14 h-14 rounded-lg bg-orange-200 flex items-center justify-center">
            <ClockIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {Helper.getTimeListen(data?.stats?.listen_time || 0, true)}
            </span>
            <span className="text-sm">Listening time</span>
          </div>
        </div>

        <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-blue-100 text-blue-600">
          <div className="w-14 h-14 rounded-lg bg-blue-200 flex items-center justify-center">
            <DocumentTextIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {data?.stats?.unique_correct_words_num || 0}
            </span>
            <span className="text-sm">Listening words</span>
          </div>
        </div>

        <div className="w-1/4 flex gap-6 p-4 rounded-lg bg-purple-100 text-purple-600">
          <div className="w-14 h-14 rounded-lg bg-purple-200 flex items-center justify-center">
            <CheckBadgeIcon className="w-6 h-6" />
          </div>

          <div className="flex flex-col justify-between">
            <span className="text-2xl font-medium">
              {((data?.stats?.avg_accuracy || 0) * 100).toFixed(2)}%
            </span>
            <span className="text-sm">Average accuracy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
