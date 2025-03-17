'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { useSaveAndContinue } from '@/app/onboarding/hooks';
import { Button, Input } from '@/components/common';
import { MeHook } from '@/store/me/hooks';

export function School() {
  const me = MeHook.useMe();

  const [value, setValue] = useState<string>();

  useEffect(() => {
    setValue(me?.school ?? undefined);
  }, [me?.school]);

  const { saveAndContinue, isMutating } = useSaveAndContinue(
    'school',
    value,
    '/onboarding/occupation'
  );

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-mesh-gradient">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900">
          <Link
            href="/onboarding/address"
            className="flex items-center gap-2 cursor-pointer"
            aria-hidden="true"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại
          </Link>
          <p>4/7</p>
        </div>

        {/* Body */}
        <div className="text-left text-base py-10 w-full sm:w-auto">
          <div className="mb-6">
            <img
              src="/static/svg/students.svg"
              className="h-[56px] w-auto"
              alt="icon"
            />
          </div>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Học sinh / sinh viên trường
          </h1>

          <p className="mb-6 text-gray-500">
            Điền tên trường bạn đang (hoặc đã) học vào ô bên dưới bạn nhé
          </p>

          <Input
            type="text"
            size="x-large"
            className="mb-8"
            placeholder="Tên trường"
            defaultValue={me?.school ?? undefined}
            onChange={(e) => setValue(e.target.value)}
          />

          <Button
            size="large"
            disabled={!value}
            onClick={saveAndContinue}
            loading={isMutating}
          >
            Tiếp tục
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-900 opacity-0">
          <Link
            href="https://app.wele-learn.com"
            className="text-primary hover:text-primary-700"
          >
            Trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
