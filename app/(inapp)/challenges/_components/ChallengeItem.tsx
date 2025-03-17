import {
  CircleStackIcon,
  MicrophoneIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

import { TimeStatus } from '@/app/(inapp)/challenges/_components/TimeStatus';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import Constants from '@/core/Constants';
import { Challenge } from '@/modules/challenge/challenge';

export type ChallengeItemProps = {
  data: RawChallenge;
  className?: string;
};

export function ChallengeItem({ data, className }: ChallengeItemProps) {
  return (
    <Link
      key={data.id}
      className={twMerge(
        'flex flex-col bg-white shadow-sm rounded-lg p-4 cursor-pointer hover:shadow transition-all w-[calc(25%-(32px*3/4))]',
        className
      )}
      href={Challenge.getURL(data)}
    >
      <div
        className="w-full h-[126px] rounded-lg mb-4 bg-cover bg-center"
        style={{
          backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
        }}
      />

      <h3 className="text-base font-medium text-gray-900 mb-4 line-clamp-1">
        {data.name}
      </h3>

      <div className="flex items-center justify-between text-sm mb-4">
        <p className="flex gap-2 items-center">
          <MicrophoneIcon className="w-5 h-5 text-gray-700" />

          <span className="text-gray-700">
            {data.podcasts_data?.length} podcasts
          </span>
        </p>

        <TimeStatus data={data} />
      </div>

      <div className="flex-1">
        <p
          className="text-sm text-gray-500 line-clamp-2 h-10 mb-6"
          dangerouslySetInnerHTML={{ __html: data.description ?? '' }}
        />
      </div>

      <div className="flex items-center justify-between">
        {!!data?.members_data?.length && (
          <p className="text-sm text-gray-700 flex items-center gap-2">
            <UserPlusIcon className="w-5 h-5" />
            {data.members_data.length} người tham gia
          </p>
        )}

        <div className="flex items-center gap-2 text-sm">
          <CircleStackIcon className="w-5 h-5 text-orange-500" />
          <span>
            <span className="text-green-500">+{data.reward_coin}</span>
            <span className="text-gray-500"> / </span>
            <span className="text-red-500">-{data.lost_coin}</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
