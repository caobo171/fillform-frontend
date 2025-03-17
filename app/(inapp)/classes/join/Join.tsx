'use client';

import {
  AcademicCapIcon,
  CheckCircleIcon,
  FaceFrownIcon,
} from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

import { Button, Loading } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

export function Join() {
  const router = useRouter();

  const token = useSearchParams().get('token');

  const { isLoading, data } = useSWRImmutable(
    ['/api/wele.class/join.public.link', { token }],
    Fetch.getFetcher.bind(Fetch)
  );

  const res = useMemo(() => data?.data as AnyObject, [data]);

  const content = useMemo(() => {
    if (res?.code === Code.Error) {
      return (
        <>
          <div className="flex justify-center mb-4">
            <FaceFrownIcon className="w-14 text-red-500" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Tham gia lớp thất bại
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            {res?.status === 'EXPIRED'
              ? 'Link tham gia lớp đã hết hạn.'
              : 'Đã có lỗi xảy ra trong quá trình tham gia lớp học.'}
            <br />
            Kiểm tra lại link hoặc liên hệ với giáo viên bạn nhé.
          </p>

          <div className="flex justify-center">
            <Button onClick={() => router.push('/home')}>
              Quay lại trang chủ
            </Button>
          </div>
        </>
      );
    }

    if (res?.status === 'JOINED') {
      return (
        <>
          <div className="flex justify-center mb-4">
            <CheckCircleIcon className="w-14 text-red-500" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Đã tham gia
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            Bạn đã tham gia lớp{' '}
            <span className="font-bold">{res?.weleclass?.name}</span> trước đó
            rồi.
          </p>

          <div className="flex items-center justify-center gap-2">
            <Button
              onClick={() =>
                router.push(`/classes/detail/${res?.weleclass?.id}`)
              }
            >
              Đi vào lớp
            </Button>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="flex justify-center mb-4">
          <AcademicCapIcon className="w-14 text-primary" />
        </div>

        <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
          Chào mừng bạn đến với lớp
        </h1>

        <p className="text-sm text-center text-gray-500 mb-6">
          Chúc mừng bạn vừa tham gia thành công vào lớp học{' '}
          <span className="font-bold">{res?.weleclass?.name}</span>.
        </p>

        <div className="flex justify-center">
          <Button
            onClick={() => router.push(`/classes/detail/${res?.weleclass?.id}`)}
          >
            Đi vào lớp
          </Button>
        </div>
      </>
    );
  }, [router, res]);

  return (
    <div className="h-screen flex items-start justify-center bg-gray-50">
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
  );
}
