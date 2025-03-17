'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { useSaveAndContinue } from '@/app/onboarding/hooks';
import { Button, Select } from '@/components/common';
import { useCities } from '@/hooks/place';
import { MeHook } from '@/store/me/hooks';

export function Address() {
  const me = MeHook.useMe();

  const [value, setValue] = useState<string>();

  useEffect(() => {
    setValue(me?.city);
  }, [me?.city]);

  const { saveAndContinue, isMutating } = useSaveAndContinue(
    'city',
    value,
    '/onboarding/school'
  );

  const { cities } = useCities();

  const cityNames = useMemo(
    () => [
      ...(cities?.map((city) => ({ label: city.name, value: city.name })) ??
        []),
      { label: 'Nước ngoài', value: 'Nước ngoài' },
    ],
    [cities]
  );

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-mesh-gradient">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900">
          <Link
            href="/onboarding/birthday"
            className="flex items-center gap-2 cursor-pointer"
            aria-hidden="true"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại
          </Link>
          <p>3/7</p>
        </div>

        {/* Body */}
        <div className="text-left text-base py-10 w-full sm:w-auto">
          <div className="mb-6">
            <img
              src="/static/svg/house.svg"
              className="h-[56px] w-auto"
              alt="icon"
            />
          </div>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Nơi ở hiện tại
          </h1>

          <p className="mb-6 text-gray-500">Click để chọn bạn nhé</p>

          <Select
            options={cityNames}
            size="x-large"
            className="mb-8 min-w-[240px]"
            placeholder="Chọn địa chỉ"
            value={value}
            onChange={(val) => setValue(String(val))}
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
