'use client';

import {
  KeyIcon,
  ShieldCheckIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Suspense, useRef, useState } from 'react';

import { Button, Input } from '@/components/common';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

function ResetPassword() {
  const router = useRouter();

  const token = useSearchParams().get('token');

  const passwordRef = useRef<HTMLInputElement>(null);

  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const [error, setError] = useState<string>('');

  const [success, setSuccess] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);

  const onSubmitHandle = async (e: React.FormEvent) => {
    e.preventDefault();

    const password = passwordRef?.current?.value;

    const confirmPassword = confirmPasswordRef?.current?.value;

    if (!password) {
      passwordRef?.current?.focus();

      return;
    }

    if (!confirmPassword) {
      confirmPasswordRef?.current?.focus();

      return;
    }

    setLoading(true);

    const res: AnyObject = await Fetch.post(`/api/auth/reset.password`, {
      password,
      verify_password: confirmPassword,
      token,
    });

    if (res?.data?.code === Code.Error) {
      setError(res?.data?.message);

      setSuccess('');
    } else {
      setSuccess('success');

      setError('');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <>
        <Meta title="Fillform | Thay đổi mật khẩu" />

        <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
          <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
            <div className="flex justify-center mb-4">
              <ShieldCheckIcon className="w-14 text-primary" />
            </div>

            <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
              Cập nhật mật khẩu mới thành công
            </h1>

            <p className="text-sm text-center text-gray-500 mb-6">
              Quay lại trang đăng nhập <br /> để bắt đầu với mật khẩu mới của
              bạn
            </p>

            <div className="flex flex-col justify-center items-center gap-6">
              <Button
                type="solid"
                className="w-full"
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

  return (
    <>
      <Meta title="Fillform | Thay đổi mật khẩu" />

      <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
        <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
          <div className="flex justify-center mb-4">
            <KeyIcon className="w-14 text-primary" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Đặt lại mật khẩu
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            Điền thông tin mật khẩu mới của bạn để đặt lại mật khẩu.
          </p>

          <form onSubmit={onSubmitHandle}>
            <Input
              ref={passwordRef}
              className="w-full mb-2"
              placeholder="Mật khẩu mới"
              type="password"
            />

            <Input
              ref={confirmPasswordRef}
              className="w-full mb-4"
              placeholder="Xác nhận mật khẩu mới"
              type="password"
            />

            {error && (
              <span className="flex gap-2 text-sm text-primary mb-4">
                <XCircleIcon className="w-5 h-5" /> {error}
              </span>
            )}

            <div className="flex flex-col justify-center items-center gap-6">
              <Button
                type="solid"
                className="w-full"
                loading={loading}
                htmlType="submit"
              >
                Cập nhật mật khẩu
              </Button>

              <Link
                href="/authentication/login"
                className="text-primary text-sm font-medium hover:text-primary-700"
              >
                Quay lại đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPassword />
    </Suspense>
  );
}
