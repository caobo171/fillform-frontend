import clsx from 'clsx';
import React, { useMemo } from 'react';

import {
  useChallengeDetailWithPaginationMembers,
  useUserListExpand,
} from '@/app/(inapp)/challenges/challengeHook';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { Pagination } from '@/components/common';
import Avatar from '@/components/ui/Avatar';

type UserListProps = {
  challenge: RawChallenge;
};

const PageSize = 2000;

export function UserList({ challenge }: UserListProps) {
  const [page, setPage] = React.useState(1);

  const { data } = useChallengeDetailWithPaginationMembers(
    challenge.id,
    page,
    PageSize
  );

  const { users, loading } = useUserListExpand(data);

  const content = useMemo(() => {
    if (loading) {
      return new Array(PageSize)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="rounded-lg bg-gray-200 animate-pulse h-[72px]"
          />
        ));
    }

    return users.map((item, index) => (
      <div
        key={item.id}
        aria-hidden="true"
        className="flex gap-4 items-center justify-between p-4 rounded-lg bg-white w-full text-sm text-gray-900"
      >
        <div className="w-[300px] flex gap-4 items-center">
          <span className="font-medium">
            {(page - 1) * PageSize + index + 1}.
          </span>

          <Avatar user={item} size={40} />

          <span className="line-clamp-1">{item.fullname}</span>
        </div>

        <div className="relative w-[100px]">
          <div
            title={`${item.numberOfFinishedPodcast}/${challenge.podcasts?.length}`}
            className={clsx(
              `overflow-hidden h-1.5 text-xs flex rounded-full bg-gray-200`
            )}
          >
            <div
              style={{
                width: `${((item.numberOfFinishedPodcast ?? 0) / (challenge?.podcasts?.length ?? 0)) * 100}%`,
              }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {item.totalPoint?.toFixed(2)}
          <img
            src="/static/svg/star-medal.svg"
            alt="icon"
            className="w-4 h-4"
          />
        </div>
      </div>
    ));
  }, [challenge.podcasts?.length, loading, page, users]);

  return (
    <div className="flex flex-col gap-3">
      <div
        className={clsx('flex items-end justify-between', {
          hidden: !challenge?.members_data?.length,
        })}
      >
        <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-2">
          Các bạn đã tham gia ({challenge?.members_data?.length})
        </h3>
      </div>

      <div className="flex flex-col gap-2">{content}</div>

      <Pagination
        total={challenge?.members_data?.length}
        current={page}
        pageSize={PageSize}
        onChange={setPage}
      />
    </div>
  );
}
