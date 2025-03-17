'use client';

import { ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';
import { clsx } from 'clsx';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { useSaveAndContinue } from '@/app/onboarding/hooks';
import { Button } from '@/components/common';
import { MeHook } from '@/store/me/hooks';

type GenderObject = {
  label: string;
  value: string;
  image: string;
};

const GenderOptions: GenderObject[] = [
  {
    label: 'Nữ',
    value: 'female',
    image: '/static/svg/girl-avatar.svg',
  },
  {
    label: 'Nam',
    value: 'male',
    image: '/static/svg/boy-avatar.svg',
  },
  {
    label: 'Khác',
    value: 'other',
    image: '/static/svg/other-avatar.svg',
  },
];

export function Gender() {
  const me = MeHook.useMe();

  const [value, setValue] = useState<GenderObject['value']>();

  useEffect(() => {
    setValue(me?.sex);
  }, [me?.sex]);

  const { saveAndContinue, isMutating } = useSaveAndContinue(
    'sex',
    value,
    '/onboarding/birthday'
  );

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-mesh-gradient">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900">
          <Link
            href="/onboarding/welcome"
            className="flex items-center gap-2 cursor-pointer"
            aria-hidden="true"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại
          </Link>
          <p>1/7</p>
        </div>

        {/* Body */}
        <div className="text-left text-base py-10 w-full sm:w-auto">
          <div className="mb-6">
            <img
              src="/static/svg/gender.svg"
              className="h-[56px] w-auto"
              alt="icon"
            />
          </div>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Giới tính của bạn là?
          </h1>

          <p className="text-gray-500">
            Click vào hình ảnh ở dưới để chọn bạn nhé
          </p>

          <div className="my-8 flex justify-between gap-6">
            {GenderOptions.map((item) => (
              <div
                key={item.value}
                className={twMerge(
                  'relative flex flex-col items-center gap-2 cursor-pointer ring-[1px] ring-gray-200 p-4 rounded-lg',
                  clsx({ 'ring-[2px] ring-primary': value === item.value })
                )}
                onClick={() => setValue(item.value)}
                aria-hidden="true"
              >
                <img
                  src={item.image}
                  alt="avatar"
                  className="w-[100px] h-[100px] rounded-full"
                />

                <span className="text-gray-900">{item.label}</span>

                {value === item.value && (
                  <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center absolute top-[-10px] right-[-10px] z-1">
                    <CheckIcon className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button
            size="large"
            disabled={!value}
            loading={isMutating}
            onClick={saveAndContinue}
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
