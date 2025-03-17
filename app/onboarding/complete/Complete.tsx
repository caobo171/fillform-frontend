'use client';

import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/common';
import { MeHook } from '@/store/me/hooks';

export function Complete() {
  const me = MeHook.useMe();

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-mesh-gradient">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900" />

        {/* Body */}
        <div className="text-left text-base py-10 w-full sm:w-auto">
          <div className="mb-6">
            <img
              src="/static/svg/cheers.svg"
              className="h-[64px] w-auto"
              alt="icon"
            />
          </div>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Yay!
          </h1>

          <p className="mb-6 text-gray-500">
            Bạn đã hoàn thành màn giới thiệu đầy ấn tượng, bây giờ thì bắt đầu
            luyện tập thôi nào
          </p>

          <Link href="https://app.wele-learn.com">
            <Button size="large" className="">
              Bắt đầu luyện tập
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-900" />
      </div>
    </div>
  );
}
