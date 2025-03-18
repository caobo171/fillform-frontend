'use client';

import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { useEffect } from 'react';

import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';

export function ProfileUpdateReminder() {
  const me = MeHook.useMe();

  useEffect(() => {
    LogEvent.sendEvent('show.banner', {
      type: 'banner',
      name: 'update_profile',
      user: me?.id,
    });
  }, [me?.id]);

  return (
    <Link
      href="/user/account"
      className="group cursor-pointer bg-[url('/static/home/banner-bg.png')] bg-cover bg-center h-[100px] rounded-lg flex items-center justify-center -mb-4"
      onClick={() =>
        LogEvent.sendEvent('click.banner', {
          type: 'banner',
          name: 'update_profile',
          user: me?.id,
        })
      }
    >
      <div className="flex items-center justify-center gap-4">
        <p className="text-sm font-bold text-white">
          Cập nhật profile, nhận ngay Fillform coins
        </p>

        <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 duration-200">
          <ArrowLongRightIcon className="w-5 h-5 text-primary" />
        </span>
      </div>
    </Link>
  );
}
