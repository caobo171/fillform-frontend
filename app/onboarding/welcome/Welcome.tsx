'use client';

import { useLocalStorage } from '@uidotdev/usehooks';
import Link from 'next/link';
import React, { useEffect } from 'react';

import { Button } from '@/components/common';
import { OnboardingStorageKey } from '@/core/Constants';
import { MeHook } from '@/store/me/hooks';

export function Onboarding() {
  const me = MeHook.useMe();

  const [, setLastOnboarding] = useLocalStorage(OnboardingStorageKey);

  useEffect(() => {
    setLastOnboarding(new Date().toISOString());
  }, [setLastOnboarding]);

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
            Xin chào {me?.fullname}
          </h1>

          <p className="mb-6 text-gray-500">
            Trước khi bắt đầu học tập, bạn hãy giới thiệu một chút về bản thân
            cho mọi người cùng biết nhé
          </p>

          <Link href="/onboarding/gender">
            <Button size="large" className="">
              Tiếp tục
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-900" />
      </div>
    </div>
  );
}
