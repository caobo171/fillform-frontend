'use client';

import {
  EnvelopeIcon,
  KeyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useRef, useState } from 'react';

import { Button, Input } from '@/components/common';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

function ForgotPassword() {
  const router = useRouter();

  const emailRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string>('');

  const [success, setSuccess] = useState<string>('');

  const onSubmitHandle = async (e: React.FormEvent) => {
    e.preventDefault();

    const email = emailRef?.current?.value;

    if (!email) {
      emailRef?.current?.focus();

      return;
    }

    setLoading(true);

    const res: AnyObject = await Fetch.post(`/api/auth/forgot.password`, {
      email,
    });

    if (res?.data?.code === Code.Error) {
      setError(res?.data?.message);

      setSuccess('');
    } else {
      setSuccess(email);

      setError('');
    }

    setLoading(false);
  };

  if (success) {
    return (
      <>
        <Meta title="Fillform | Quên mật khẩu" />

        <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
          <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
            <div className="flex justify-center mb-4">
              <EnvelopeIcon className="w-14 text-primary" />
            </div>

            <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
              Kiểm tra email của bạn
            </h1>

            <p className="text-sm text-center text-gray-500 mb-6">
              Fillform đã gửi email hướng dẫn thay đổi mật khẩu tới&nbsp;
              <span className="text-primary">{success}</span>
            </p>

            <div className="flex flex-col justify-center items-center gap-6">
              <Button onClick={() => router.push('/authentication/login')}>
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
      <Meta title="Fillform | Quên mật khẩu" />

      <div className="w-screen h-screen flex items-start justify-center bg-gray-50">
        <div className="w-full sm:w-[468px] flex flex-col my-4 sm:my-20 mx-4 sm:mx-0 p-10 shadow-sm rounded-lg ring-1 ring-gray-100 bg-white">
          <div className="flex justify-center mb-4">
            <KeyIcon className="w-14 text-primary" />
          </div>

          <h1 className="text-center text-lg font-medium text-gray-900 mb-2">
            Quên mật khẩu?
          </h1>

          <p className="text-sm text-center text-gray-500 mb-6">
            Điền email đã đăng kí tài khoản của bạn <br /> để nhận hướng dẫn đổi
            lại mật khẩu
          </p>

          <form onSubmit={onSubmitHandle}>
            <Input ref={emailRef} className="w-full mb-4" placeholder="Email" />

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
                Tiếp tục
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

export default ForgotPassword;
