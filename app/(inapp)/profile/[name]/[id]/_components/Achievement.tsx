'use client';

import { clsx } from 'clsx';
import { orderBy } from 'lodash';
import { useMemo, useState } from 'react';

import { Modal } from '@/components/common';
import { BADGES } from '@/core/Constants';
import { RawBadge } from '@/store/types';

type BadgeItemObject = {
  value: string;
  type: string;
  name: string;
  description: string;
  image: string;
  active?: boolean;
};

function BadgeItem(props: {
  data: BadgeItemObject;
  style?: React.CSSProperties;
}) {
  const { data, style } = props;

  return (
    <div style={style}>
      <div className="flex items-center gap-4">
        <img
          className={clsx('w-8', { grayscale: !data?.active })}
          src={data?.image}
          alt="badge"
        />

        <div className="flex flex-col gap-1">
          <p className="text-sm text-gray-900 font-semibold">{data?.name}</p>

          <p className="text-sm text-gray-500">{data?.description}</p>
        </div>
      </div>
    </div>
  );
}

export function Achievement(props: { badges: RawBadge[] }) {
  const { badges } = props;

  const [openModal, setOpenModal] = useState(false);

  const badgeList: BadgeItemObject[] = useMemo(() => {
    const remapList = BADGES.map((item) => ({
      ...item,
      active: !!badges.find((b) => b.badge_name === item.value),
    }));

    return orderBy(remapList, ['active'], ['desc']);
  }, [badges]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-900 font-semibold">
          Danh hiệu ({badges.length} / {BADGES.length})
        </p>

        <p
          aria-hidden="true"
          className="text-sm text-primary cursor-pointer hover:text-primary-700"
          onClick={() => setOpenModal(true)}
        >
          Xem tất cả
        </p>
      </div>

      <div className="rounded-lg bg-white px-6 py-6">
        <div className="flex flex-wrap w-full gap-x-6 gap-y-8">
          {badgeList.map(
            (badge, index) =>
              index < 3 && (
                <BadgeItem
                  key={badge.value}
                  data={badge}
                  style={{ width: 'calc(33.33% - 16px)' }}
                />
              )
          )}
        </div>
      </div>

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title="Tất cả danh hiệu của WELE"
        width="1200px"
      >
        <div className="flex flex-wrap gap-8 max-h-screen-80 overflow-y-auto custom-scrollbar py-4">
          {badgeList.map((badge) => (
            <BadgeItem
              key={badge.value}
              data={badge}
              style={{ width: 'calc(25% - 24px)' }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
