import { CircleStackIcon } from '@heroicons/react/24/solid';
import React, { useCallback } from 'react';
import { toast } from 'react-toastify';

export function useEarnedCoinNotify() {
  const notify = useCallback((earnedCoin: number) => {
    toast.info(
      <>
        <h4 className="text-base font-medium text-green-500">
          +{earnedCoin} coins
        </h4>
        <p>Chúc mừng bạn đã được +{earnedCoin} coins vào Ví 2</p>
      </>,
      {
        autoClose: 15000,
        icon: <CircleStackIcon className="w-5 h-5 text-orange-500" />,
      }
    );
  }, []);

  return { notify };
}
