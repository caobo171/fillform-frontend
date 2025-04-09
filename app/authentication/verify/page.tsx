'use client';

import { CheckBadgeIcon, FaceFrownIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { Button, Loading } from '@/components/common';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

function ConfirmRegister() {
  const router = useRouter();

  const token = useSearchParams().get('token');

  const { isLoading, data, error } = useSWRImmutable(
    ['/api/auth/verify', { token }],
    Fetch.getFetcher.bind(Fetch)
  );

  const activated = useMemo(() => {
    const res = data?.data as AnyObject;

    if ((res && res?.code === Code.Error) || error) {
      return null;
    }

    return { fullName: res?.fullname };
  }, [data, error]);

  const content = useMemo(() => {
    if (!activated) {
      return (
        <>
          <div className="flex justify-center mb-4">
            <FaceFrownIcon className="w-14 text-red-500" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Xác thực thất bại
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            Đã có lỗi xảy ra trong quá trình xác thực tài khoản.
            <br />
            Kiểm tra email của bạn và thử lại nhé.
          </p>

          <div className="text-center">
            <Button onClick={() => router.push('/authentication/login')}>
              Quay lại đăng nhập
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-center mb-4">
          <CheckBadgeIcon className="w-14 text-primary" />
        </div>

        <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
          Chào mừng&nbsp;
          <span className="text-primary">{activated?.fullName}</span>
        </h1>

        <p className="text-sm text-center text-gray-500 mb-6">
          Chúc mừng! Tài khoản của bạn đã được <br />
          xác thực thành công.&nbsp;
        </p>

        <Button
          onClick={() =>
            router.push('/authentication/login')
          }
        >
          Bắt đầu sử dụng Fillform
        </Button>
      </>
    );
  }, [activated, router]);

  return (
    <>
      <Meta title="Fillform | Xác thực tài khoản" />
      <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
        <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center">
              <Loading className="text-primary h-6 w-6" />
            </div>
          ) : (
            content
          )}
        </div>
      </div>
    </>
  );
}

export default ConfirmRegister;
