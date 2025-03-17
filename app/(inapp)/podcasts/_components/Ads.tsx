'use client';

import React from 'react';

import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';

const AdList = [
  {
    img: '/static/ads/AI-hay-2.jpeg',
    link: 'https://ai-hay.vn/ask?utm_source=wele&utm_medium=banner&utm_campaign=wele_banner_nov',
    name: 'ai-hay',
  },
];

export function Ads() {
  const me = MeHook.useMe();

  return (
    <div className="w-[280px] flex flex-col gap-4 mt-[64px]">
      <div className="flex flex-col gap-3 justify-center items-center">
        <div className="text-gray-900 text-sm rounded-lg border border-orange-500 p-4">
          <p className="mb-1 font-semibold">
            Click quảng cáo để ủng hộ WELE bạn nhé!
          </p>
          <p className="text-orange-500">
            Một cú click vào quảng cáo nhỏ ở phía dưới thôi cũng là cách tuyệt
            vời để bọn mình có thêm động lực và nguồn lực tiếp tục phát triển
            các tính năng mới trong tương lai.
          </p>
        </div>

        <img
          src="/static/svg/hand-pointing-down.svg"
          alt="icon"
          className="w-6 h-6 animate-bounce"
        />
      </div>

      {AdList.map((ad) => (
        <a
          key={ad.name}
          href={ad.link}
          target="_blank"
          className="rounded-lg overflow-hidden w-full"
          onClick={() =>
            LogEvent.sendEvent('click.ad', {
              type: 'ad',
              name: ad.name,
              user: me?.id,
              link: ad.link,
              page: 'podcasts',
            })
          }
        >
          <img src={ad.img} alt={ad.name} className="w-full" />
        </a>
      ))}
    </div>
  );
}
