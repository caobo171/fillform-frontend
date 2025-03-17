'use client';

import { TrophyIcon } from '@heroicons/react/24/outline';
import React, { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { UserBlockSkeleton } from '@/components/block/UserBlock';
import { Button, Modal } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import { useUser } from '@/hooks/user';
import { RawUser } from '@/store/types';

interface BillboardItemProps {
  user_id: number;
  index: number;
  score: number;
  percent?: number;
}

function BillboardItem(props: BillboardItemProps) {
  const { user_id, percent, index, score } = props;
  const { data, isLoading } = useUser(user_id);

  if (isLoading) {
    return <UserBlockSkeleton />;
  }

  if (!data || !data?.fullname) {
    return null;
  }

  return (
    <div className="flex justify-between items-center text-sm text-gray-900">
      <div className="flex items-center gap-4">
        <span className="w-4">{index + 1}.</span>

        <Avatar size={40} user={data as RawUser} />

        <span>{data.fullname}</span>
      </div>

      <div className="flex justify-center items-center gap-2">
        <div className="flex items-center gap-1">
          <span className="text-gray-900">{score.toFixed(2)}</span>

          <span className="text-green-500">
            {percent !== undefined ? `(${Math.floor(percent * 100)}%)` : ''}
          </span>
        </div>

        <img src="/static/svg/star-medal.svg" alt="star medal" />
      </div>
    </div>
  );
}

export function ResultBillboard({
  members,
}: {
  members: { user_id: number; score: number; percent?: number }[];
}) {
  const [more, showMore] = useState(false);

  const showMembers = useMemo(
    () =>
      members.length > 0 && members[0]?.percent
        ? members.sort((a, b) => (b?.percent || 0) - (a?.percent || 0))
        : members.sort((a, b) => b.score - a.score),
    [members]
  );

  return (
    <div className="w-full h-full flex flex-col px-6 py-4 gap-6 rounded-lg text-gray-900 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center">
          <TrophyIcon className="w-5 h-5 text-white" />
        </div>

        <h3 className="font-semibold text-xl flex-1">Kỷ lục</h3>

        <span className="text-sm flex gap-2">
          Điểm <span className="text-green-500">(Độ chính xác)</span>
        </span>
      </div>

      <div className="w-full flex-1 flex flex-col gap-4">
        {showMembers.map(
          (member, index) =>
            index < 5 && (
              <BillboardItem
                key={uuidv4()}
                index={index}
                user_id={member.user_id}
                score={member.score}
                percent={member.percent}
              />
            )
        )}
      </div>

      {members.length > 5 && (
        <div className="flex justify-center">
          <Button onClick={() => showMore(true)} type="outline">
            Xem tất cả
          </Button>
        </div>
      )}

      <Modal
        width="500px"
        open={more}
        onCancel={() => showMore(false)}
        title="Kỷ lục"
        cancelButtonProps={{ className: 'hidden' }}
        onOk={() => showMore(false)}
      >
        <div className="w-full flex-1 flex flex-col gap-4 py-4 max-h-screen-80 overflow-y-auto">
          {showMembers.map((member, index) => (
            <BillboardItem
              key={uuidv4()}
              index={index}
              user_id={member.user_id}
              score={member.score}
              percent={member.percent}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
