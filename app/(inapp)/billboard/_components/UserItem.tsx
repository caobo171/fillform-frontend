import clsx from 'clsx';

import { JourneyObject } from '@/app/(inapp)/billboard/billboardHelper';
import Avatar from '@/components/ui/Avatar';
import { Helper } from '@/services/Helper';
import { RawUser } from '@/store/types';

type UserItemProps = {
  user: RawUser;
  rank: number;
  journey: JourneyObject;
  highlight?: boolean;
};

export function UserItem({ user, rank, journey, highlight }: UserItemProps) {
  return (
    <div
      key={user.username}
      className={clsx(
        'flex items-center justify-between gap-4 text-sm text-gray-900 px-6 py-4 rounded-lg bg-gray-100',
        { 'border-2 border-gray-500': highlight }
      )}
    >
      <span className="w-6 text-left">{rank}</span>

      <div className="flex-1 flex gap-3 items-center">
        <Avatar user={user} size={40} />

        <div className="flex flex-col gap-1">
          <span className="font-medium text-gray-900 line-clamp-1">
            {user.fullname}
          </span>

          <a
            href="https://blog.wele-learn.com/cau-chuyen-cua-wele-the-wallaby/"
            className="text-xs text-gray-500 flex items-center gap-[4px]"
            target="_blank"
          >
            <img
              src={`/static/flags/${journey.flag}.svg`}
              className="h-[14px] w-auto"
            />
            <span className="line-clamp-1">{journey.name}</span>
          </a>
        </div>
      </div>

      <span className="flex items-center gap-1.5">
        {Helper.formatNumber(user.score)}{' '}
        <img
          width={16}
          height={16}
          src="/static/svg/star-medal.svg"
          alt="medal-icon"
        />
      </span>
    </div>
  );
}
