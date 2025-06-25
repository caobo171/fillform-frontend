'use client';

import { XCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { z } from 'zod';

import { Button, Checkbox, Input } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Cookie from '@/lib/core/fetch/Cookie';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';

const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
  keep_login: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const router = useRouter();

  const from = useSearchParams().get('from');

  const [errorMessage, setErrorMessage] = useState<string>();

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit: SubmitHandler<LoginFormValues> = async (formData) => {
    const { username, password, keep_login } = formData;

    if (!username || !password) {
      return;
    }

    try {
      const res: AnyObject = await Fetch.post('/api/auth/signin', {
        password,
        username,
        keep_login: keep_login ? 1 : 0,
      });

      if (res && res.data && res.data.code === Code.SUCCESS) {
        Cookie.set('access_token', res.data.access_token, 100);

        mutate('/api/me/profile');

        // router.push(from ?? '/home');

        window.location.pathname = from ?? '/';
      } else {
        setErrorMessage(res?.data?.message);
      }
    } catch (e) {
      setErrorMessage('Something went wrong!');
    }
  };

  return (
    <>
      <Meta title="Fillform | Đăng nhập" />

      <div className="w-screen h-screen bg-cover bg-center bg-[url('/static/background_index.jpg')]">
        <div className="relative bg-white flex flex-col h-full justify-center items-center xl:w-1/2 2xl:w-[736px] px-6 sm:px-0">
          <div className="text-left text-sm leading-5 mb-[60px] w-full sm:w-auto">
            <Link href="/" className="inline-block">
              <img
                src="/static/logo-color-long.png"
                alt="logo"
                className="w-auto h-12 mb-6"
              />
            </Link>

            <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
              Đăng nhập
            </h1>

            <p className="mb-10 text-gray-500">
              Chào mừng bạn quay trở lại với Fillform
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full sm:w-[436px] mb-6"
            >
              <FormItem label="Email / Tên đăng nhập" className="mb-6">
                <Controller
                  render={({ field }) => (
                    <Input {...field} className="w-full" size="large" />
                  )}
                  name="username"
                  control={control}
                />
              </FormItem>

              <FormItem label="Mật khẩu" className="mb-6">
                <Controller
                  render={({ field }) => (
                    <Input
                      className="w-full"
                      type="password"
                      {...field}
                      size="large"
                    />
                  )}
                  name="password"
                  control={control}
                />
              </FormItem>

              <div className="mb-8 flex items-center justify-between">
                <Controller
                  render={({ field }) => (
                    <Checkbox {...field}>Nhớ tài khoản</Checkbox>
                  )}
                  name="keep_login"
                  control={control}
                />

                <Link
                  href="/authentication/forgot-password"
                  className="text-primary hover:text-primary-700"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button className="w-full" size="large" loading={isSubmitting}>
                Đăng nhập
              </Button>

              <p className="left mt-4">
                Bạn chưa có tài khoản? &nbsp;
                <Link
                  href="/authentication/register"
                  className="text-primary hover:text-primary-700"
                >
                  Đăng kí ngay
                </Link>
              </p>
            </form>

            {errorMessage && (
              <p className="text-red-500 flex items-center gap-2">
                <XCircle className="w-5 h-5" /> {errorMessage}
              </p>
            )}


          </div>
        </div>
      </div>
    </>
  );
}
