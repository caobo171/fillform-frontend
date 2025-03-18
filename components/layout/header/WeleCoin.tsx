import {
  CircleStackIcon as CircleStackIconOutline,
  WalletIcon,
} from '@heroicons/react/24/outline';
import { CircleStackIcon as CircleStackIconSolid } from '@heroicons/react/24/solid';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Popover } from '@/components/common';
import { RawUser } from '@/store/types';

type WeleCoinProps = {
  data: RawUser;
  isPremium?: boolean;
};

export function WeleCoin({ data, isPremium }: WeleCoinProps) {
  const totalCoin = useMemo(() => {
    let coin = 0;

    if (data?.allowance_coin) {
      coin += data.allowance_coin;
    }

    if (data?.earning_coin) {
      coin += data.earning_coin;
    }

    return coin;
  }, [data]);

  const button = useMemo(() => {
    if (totalCoin) {
      return (
        <div
          className={twMerge(
            'h-[40px] bg-gray-150 hover:bg-gray-200 pl-[10px] pr-[14px]',
            'flex items-center justify-center gap-1 rounded-full text-orange-500'
          )}
        >
          <CircleStackIconSolid className="w-5 h-5" />
          <span className="font-medium text-sm">{totalCoin}</span>
        </div>
      );
    }

    return (
      <div
        className={twMerge(
          'h-[40px] bg-gray-150 hover:bg-gray-200 pl-[10px] pr-[14px]',
          'flex items-center justify-center rounded-full gap-1 text-gray-500'
        )}
      >
        <CircleStackIconOutline className="w-5 h-5" />
        <span className="font-medium text-sm">{totalCoin}</span>
      </div>
    );
  }, [totalCoin]);

  return (
    <Popover
      button={button}
      popupClassName="left-1/2 -translate-x-1/2 mt-3 w-[360px]"
    >
      <div className="py-2 px-2 text-sm text-gray-900">
        <h4 className="text-base font-semibold text-gray-900 mb-2">
          Fillform Coin
        </h4>

        <p className="mb-5">
          Bạn đang có <span className="font-semibold">{totalCoin}</span> coin
          {totalCoin !== 1 && 's'} trong tài khoản
        </p>

        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between h-10 rounded-lg text-lime-600 bg-lime-50 px-3">
            <span className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" /> Ví 1
            </span>
            <span>
              {data?.allowance_coin ?? 0} coin
              {data?.allowance_coin !== 1 && 's'}
            </span>
          </div>

          <div className="flex items-center justify-between h-10 rounded-lg text-indigo-500 bg-indigo-50 px-3">
            <span className="flex items-center gap-2">
              <WalletIcon className="w-5 h-5" /> Ví 2
            </span>
            <span>
              {data?.earning_coin ?? 0} coin{data?.earning_coin !== 1 && 's'}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-1 mb-4">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-lime-600" />
            Ví 1 sẽ được reset về {isPremium ? 50 : 5} coins hàng tháng
          </span>

          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            Ví 2 sẽ tồn tại cho đến khi bạn dùng hết
          </span>
        </div>

        <p className="">
          Tìm hiểu về{' '}
          <a
            href="https://letrunghieuo8.wordpress.com/2024/06/21/ban-co-the-su-dung-wele-coins-de-lam-gi/"
            className="underline hover:text-gray-600"
            target="_blank"
          >
            cách sử dụng
          </a>{' '}
          và{' '}
          <a
            href="https://letrunghieuo8.wordpress.com/2024/06/21/cac-cach-thuc-ban-co-the-kiem-them-wele-coins/"
            className="underline hover:text-gray-600"
            target="_blank"
          >
            cách kiếm thêm
          </a>{' '}
          Fillform Coin bạn nhé.
        </p>
      </div>
    </Popover>
  );
}
