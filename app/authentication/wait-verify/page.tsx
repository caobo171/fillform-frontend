'use client';

import { EnvelopeIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/common';
import Meta from '@/components/ui/Meta';

function WaitingRegister() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const email = searchParams.get('email');

  return (
    <>
      <Meta title={'Xác thực tài khoản'} />
      <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
        <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
          <div className="flex justify-center mb-4">
            <EnvelopeIcon className="w-14 text-primary" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Kiểm tra email của bạn
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            Fillform đã gửi 1 email tới&nbsp;
            <span className="text-primary">
              {decodeURIComponent(email ?? '')}
            </span>
            . Nhấn vào link đính kèm trong email để xác thực tài khoản của bạn.
          </p>

          <div className="flex justify-center gap-4">
            <Button type="outline" className="hidden">
              Gửi lại email
            </Button>

            <Button
              type="solid"
              onClick={() => router.push('/authentication/login')}
            >
              Quay lại đăng nhập
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default WaitingRegister;
