'use client';

import {
  ArrowDownTrayIcon,
  ArrowPathIcon,
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
  RocketLaunchIcon,
  SpeakerWaveIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import { useWindowScroll } from '@uidotdev/usehooks';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { orderBy } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { twMerge } from 'tailwind-merge';

import { Loading, Pagination } from '@/components/common';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';

dayjs.extend(relativeTime);

const CoinActionType: { [key: string]: string } = {
  UPDATE_FIELD_PURPOSE: 'Cập nhật thông tin',
  RESET_EVERY_MONTH_PURPOSE: 'Đặt lại xu hàng tháng',
  GET_WRONG_HINTS_PURPOSE: 'Dùng coin hiện ô sai',
  GET_WORDS_RESULT_PURPOSE: 'Dùng coin tải file kết quả',
  LISTEN_PODCAST_AGAIN_PURPOSE: 'Nghe lại podcast',
  REJECT_SHARE_SOCIAL_PURPOSE: 'Xác nhận chia sẻ trên mạng xã hội',
  SHARE_SOCIAL_PURPOSE: 'Chia sẻ bài viết',
  SUBMIT_PODCAST_PURPOSE: 'Nộp bài podcast',
  REFER_PURPOSE: 'Giới thiệu bạn bè',
  ADMIN_CHANGE_COIN_PURPOSE: 'Thay đổi từ Admin',
  JOIN_CHALLENGE_PURPOSE: 'Tham gia thử thách',
  FINISH_CHALLENGE_PURPOSE: 'Hoàn thành thử thách',
};

type RawCoinHistory = {
  content: string;
  create_at: number;
  id: number;
  new_balance: number;
  old_balance: number;
  purpose: string;
  coin_type: number;
  update_at: number;
  user_id: number;
};

const PageSize = 20;

export function CoinHistory() {
  const [{ x, y }, scrollTo] = useWindowScroll();

  const [page, setPage] = useState(1);

  const { data, isLoading, isValidating } = useSWR(
    ['/api/coin.history/get', { page, page_size: PageSize }],
    Fetch.getFetcher.bind(Fetch)
  );

  const histories: RawCoinHistory[] = useMemo(() => {
    const rawData = data?.data as AnyObject;

    if (!Array.isArray(rawData?.coin_histories)) {
      return [];
    }

    return orderBy(rawData.coin_histories, ['create_at'], ['desc']);
  }, [data]);

  const pagination = useMemo(() => {
    const rawData = data?.data as AnyObject;

    return {
      page: rawData?.pagination?.page ?? 1,
      total: rawData?.pagination?.total ?? 1,
    };
  }, [data]);

  const handlePageChange = useCallback(
    (p: number) => {
      setPage(p);

      scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    },
    [scrollTo]
  );

  const renderIcon = useCallback((val: RawCoinHistory) => {
    const isAdded = val.new_balance >= val.old_balance;

    let Icon = null;

    const iconClass = twMerge(
      'w-4 h-4',
      isAdded ? 'text-green-500' : 'text-red-500'
    );

    if (val.purpose === 'UPDATE_FIELD_PURPOSE') {
      Icon = UserIcon;
    }

    if (val.purpose === 'RESET_EVERY_MONTH_PURPOSE') {
      Icon = ArrowPathIcon;
    }

    if (val.purpose === 'GET_WRONG_HINTS_PURPOSE') {
      Icon = MagnifyingGlassIcon;
    }

    if (val.purpose === 'GET_WORDS_RESULT_PURPOSE') {
      Icon = ArrowDownTrayIcon;
    }

    if (val.purpose === 'LISTEN_PODCAST_AGAIN_PURPOSE') {
      Icon = SpeakerWaveIcon;
    }

    if (
      ['REJECT_SHARE_SOCIAL_PURPOSE', 'SHARE_SOCIAL_PURPOSE'].includes(
        val.purpose
      )
    ) {
      Icon = RectangleStackIcon;
    }

    if (val.purpose === 'SUBMIT_PODCAST_PURPOSE') {
      Icon = CloudArrowUpIcon;
    }

    if (val.purpose === 'REFER_PURPOSE') {
      Icon = UsersIcon;
    }

    if (val.purpose === 'ADMIN_CHANGE_COIN_PURPOSE') {
      Icon = UserIcon;
    }

    if (
      val.purpose === 'JOIN_CHALLENGE_PURPOSE' ||
      val.purpose === 'FINISH_CHALLENGE_PURPOSE'
    ) {
      Icon = RocketLaunchIcon;
    }

    return (
      <div
        className={twMerge(
          'w-10 h-10 rounded-full flex items-center justify-center',
          isAdded ? 'bg-green-50' : 'bg-red-50'
        )}
      >
        {Icon && <Icon className={iconClass} />}
      </div>
    );
  }, []);

  return (
    <div className="bg-white rounded-lg p-6 relative">
      <div className="mb-6">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Lịch sử biến động coin
        </h1>

        <p className="mt-2 text-sm text-gray-700">
          Danh sách tất các hoạt động kiếm được coin và sử dụng coin của bạn.
        </p>
      </div>

      {(isLoading || isValidating) && (
        <div className="absolute z-1 top-0 left-0 h-full w-full rounded-lg bg-opacity-50 bg-white flex items-center justify-center">
          <Loading className="text-primary" />
        </div>
      )}

      <div className="flex flex-col divide-y divide-gray-100">
        {histories.map((item) => (
          <div key={item.id} className="flex gap-3 items-center py-3">
            {renderIcon(item)}

            <div className="flex-1 flex flex-col gap-1">
              <span className="text-sm text-gray-900">{item.content}</span>

              <span className="text-xs text-gray-500">
                {CoinActionType[item.purpose]}
              </span>
            </div>

            <div className="flex flex-col gap-1 items-end">
              <span className="text-sm">
                {item.new_balance - item.old_balance >= 0 ? (
                  <span className="text-green-500">
                    +{item.new_balance - item.old_balance}
                  </span>
                ) : (
                  <span className="text-red-500">
                    {item.new_balance - item.old_balance}
                  </span>
                )}
              </span>

              <span
                className="text-xs text-gray-500"
                title={dayjs(item.update_at * 1000).format(
                  'DD/MM/YYYY HH:mm:ss'
                )}
              >
                {Helper.convertFromNowToVNText(
                  dayjs(item.update_at * 1000).fromNow()
                )}
              </span>
            </div>
          </div>
        ))}
      </div>

      {pagination.total > PageSize && (
        <Pagination
          className="mt-2"
          total={pagination.total}
          current={page}
          pageSize={PageSize}
          onChange={handlePageChange}
        />
      )}
    </div>
  );
}
