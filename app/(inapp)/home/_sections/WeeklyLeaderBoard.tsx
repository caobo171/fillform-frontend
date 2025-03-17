'use client';

import { groupBy, orderBy, sumBy } from 'lodash';
import { useMemo, useState } from 'react';

import { Section } from '@/app/(inapp)/home/_components/Section';
import Avatar from '@/components/ui/Avatar';
import { useBillboards } from '@/hooks/billboard';
import { useUsers } from '@/hooks/user';
import { Helper } from '@/services/Helper';
import { RawUser } from '@/store/types';

export default function WeeklyLeaderBoard() {
  const { data, isLoading: loadingBillboard } = useBillboards(
    new URLSearchParams('period=this-week')
  );

  const [userIds, setUserIds] = useState<number[]>([]);

  const { data: usersData, isLoading: loadingUserData } = useUsers(userIds);

  const top5Users = useMemo(() => {
    if (!Array.isArray(data?.billboards)) {
      return [];
    }

    const groupedUsers = groupBy(data.billboards, 'user_id');

    const remapUsers = Object.values(groupedUsers).map((item) => {
      const totalScore = sumBy(item, 'score');

      return { ...item[0], score: totalScore };
    });

    const sortedUsers = orderBy(remapUsers, ['score'], 'desc');

    const list = sortedUsers.slice(0, 5);

    const ids = list.map((item) => item.user_id);

    setUserIds(ids);

    return list;
  }, [data?.billboards]);

  const top5UsersDetail = useMemo(() => {
    if (!Array.isArray(usersData)) {
      return [];
    }

    return top5Users.map((item) => {
      const user = usersData.find((u: RawUser) => u.id === item.user_id);

      return { ...(user ?? {}), score: item.score } as RawUser;
    });
  }, [top5Users, usersData]);

  if (loadingBillboard || loadingUserData) {
    return (
      <div className="flex flex-col gap-6">
        <div className="w-[150px] h-[24px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-col gap-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={`weekly_ranking_${item}`}
              className="h-[40px] w-full rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Section
      title="Bảng xếp hạng tuần"
      seeMoreLink="/billboard"
      className="gap-6"
      titleClassName="text-base"
      seeMoreClassName="text-xs"
    >
      {top5UsersDetail?.length === 0 && (
        <div className="text-sm text-gray-500">Chưa có dữ liệu</div>
      )}

      <div className="flex flex-col gap-4">
        {top5UsersDetail.map(
          (item, index) =>
            item.id && (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm text-gray-900"
              >
                <div className="flex items-center gap-4">
                  <span className="w-4">{index + 1}.</span>

                  <Avatar user={item} size={40} />

                  {item.fullname}
                </div>

                <span className="flex items-center gap-1">
                  {Helper.formatNumber(item.score)}{' '}
                  <img
                    width={16}
                    height={16}
                    src="/static/svg/star-medal.svg"
                  />
                </span>
              </div>
            )
        )}
      </div>
    </Section>
  );
}
