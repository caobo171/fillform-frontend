import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import Avatar from '@/components/ui/Avatar';
import { Helper } from '@/services/Helper';
import { RawUser } from '@/store/types';

type TopUserProps = {
  data?: RawUser;
  rank: number;
  isLoading?: boolean;
};

export function TopUser({ data, rank, isLoading }: TopUserProps) {
  const size = useMemo(() => (rank === 1 ? 120 : 80), [rank]);

  const ringColor = useMemo(() => {
    if (rank === 1) {
      return 'ring-yellow-400';
    }

    if (rank === 2) {
      return 'ring-slate-200';
    }

    if (rank === 3) {
      return 'ring-orange-700';
    }

    return '';
  }, [rank]);

  const rankSize = useMemo(() => (rank === 1 ? 'w-8 h-8' : 'w-6 h-6'), [rank]);

  const rankBgColor = useMemo(() => {
    if (rank === 1) {
      return 'bg-yellow-400';
    }

    if (rank === 2) {
      return 'bg-slate-200';
    }

    if (rank === 3) {
      return 'bg-orange-700';
    }

    return '';
  }, [rank]);

  const rankTextColor = useMemo(
    () => (rank === 2 ? 'text-gray-900' : 'text-white'),
    [rank]
  );

  const wrapperClass = useMemo(
    () => (rank === 1 ? 'gap-5' : 'gap-4 translate-y-[24px]'),
    [rank]
  );

  if (isLoading) {
    return (
      <div
        className={twMerge(
          'rounded-lg bg-gray-200 animate-pulse',
          rank === 1 ? 'w-[120px] h-[160px]' : 'w-[80px] h-[120px]'
        )}
      />
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div
      className={twMerge(
        'text-sm font-medium text-gray-900 flex flex-col items-center',
        wrapperClass
      )}
    >
      <div className="relative">
        <Avatar user={data} size={size} className={ringColor} />

        <span
          className={twMerge(
            'absolute z-1 flex items-center justify-center rounded-full text-gray-500',
            'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2',
            rankSize,
            rankBgColor,
            rankTextColor
          )}
        >
          {rank}
        </span>
      </div>

      <div className="flex flex-col items-center gap-1">
        <span className="text-center">{data.fullname}</span>
        <span className="flex items-center gap-1.5 text-gray-700 text-xs py-0.5 px-1.5 bg-gray-100 rounded">
          {Helper.formatNumber(data.score)}{' '}
          <img width={12} height={12} src="/static/svg/star-medal.svg" />
        </span>
      </div>
    </div>
  );
}
