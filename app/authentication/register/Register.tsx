'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import useSWRMutation from 'swr/mutation';

import { FormInput } from '@/app/authentication/register/_components/FormInput';
import { Button } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

enum Screens {
  Email = 1,
  FullName = 2,
  UserName = 3,
  Password = 4,
  ReferCode = 5,
}

type RegisterValues = {
  email?: string;
  fullName?: string;
  userName?: string;
  password?: string;
  referCode?: string;
  confirmPassword?: string;
};

export function Register() {
  const { trigger: doCheck, isMutating: isChecking } = useSWRMutation(
    '/api/auth/check',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: submit, isMutating: submitting } = useSWRMutation(
    '/api/auth/signup',
    Fetch.postFetcher.bind(Fetch)
  );

  const router = useRouter();

  const searchParams = useSearchParams();

  const referCode = searchParams.get('ref') ?? '';

  const [screen, setScreen] = useState<Screens>(Screens.Email);

  const [error, setError] = useState<string>();

  const [values, setValues] = useState<RegisterValues>({ referCode });

  const checkEmail = useCallback(async () => {
    if (!values.email) {
      setError('Email không được để trống');

      return false;
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!emailRegex.test(values.email)) {
      setError('Định dạng email không hợp lệ, thử lại email khác bạn nhé!');

      return false;
    }

    const result: AnyObject = await doCheck({
      payload: { field: 'email', value: values.email },
    });

    if (result?.data?.code === Code.Error) {
      setError(result?.data?.message);

      return false;
    }

    return true;
  }, [doCheck, values.email]);

  const checkFullName = useCallback(() => {
    if (!values.fullName) {
      setError('Họ và tên không được để trống');

      return false;
    }

    return true;
  }, [values.fullName]);

  const checkUserName = useCallback(async () => {
    if (!values.userName) {
      setError('Tên đăng nhập không được để trống');

      return false;
    }

    const userNameRegex = /^[a-zA-Z0-9]+$/;

    if (!userNameRegex.test(values.userName)) {
      setError('Tên đăng nhập không hợp lệ, thử lại tên khác bạn nhé!');
    }

    const result: AnyObject = await doCheck({
      payload: { field: 'username', value: values.userName },
    });

    if (result?.data?.code === Code.Error) {
      setError(result?.data?.message);

      return false;
    }

    return true;
  }, [doCheck, values.userName]);

  const checkReferCode = useCallback(async () => {
    // if refer code is empty, skip checking
    if (!values.referCode) {
      return true;
    }

    const result: AnyObject = await doCheck({
      payload: { field: 'refer_code', value: values.referCode },
    });

    if (result?.data?.code === Code.Error) {
      setError(result?.data?.message);

      return false;
    }

    return true;
  }, [doCheck, values.referCode]);

  const checkPassword = useCallback(() => {
    if (!values.password) {
      setError('Mật khẩu không được để trống');

      return false;
    }

    if (values.confirmPassword !== values.password) {
      setError('Mật khẩu không khớp nhau, thử lại bạn nhé!');

      return false;
    }

    return true;
  }, [values.confirmPassword, values.password]);

  const backToPrevious = useCallback(() => {
    let newScreen: Screens = Screens.Email;

    if (screen === Screens.Email) {
      return;
    }

    if (screen === Screens.FullName) {
      newScreen = Screens.Email;
    } else if (screen === Screens.UserName) {
      newScreen = Screens.FullName;
    } else if (screen === Screens.Password) {
      newScreen = Screens.UserName;
    } else if (screen === Screens.ReferCode) {
      newScreen = Screens.Password;
    }

    setScreen(newScreen);

    setError(undefined);
  }, [screen]);

  const nextScreen = useCallback(async () => {
    if (screen === Screens.Email) {
      const isEmailValid = await checkEmail();

      // email invalid
      if (!isEmailValid) {
        return;
      }

      setScreen(Screens.FullName);
    }

    if (screen === Screens.FullName) {
      // full name invalid
      if (!checkFullName()) {
        return;
      }

      setScreen(Screens.UserName);
    }

    if (screen === Screens.UserName) {
      const isUserNameValid = await checkUserName();

      // user name invalid
      if (!isUserNameValid) {
        return;
      }

      setScreen(Screens.Password);
    }

    if (screen === Screens.Password) {
      // password invalid
      if (!checkPassword()) {
        return;
      }

      setScreen(Screens.ReferCode);
    }

    if (screen === Screens.ReferCode) {
      const isReferCodeValid = await checkReferCode();

      // refer code invalid
      if (!isReferCodeValid) {
        return;
      }

      const result: AnyObject = await submit({
        payload: {
          email: values.email,
          fullname: values.fullName,
          username: values.userName,
          password: values.password,
          confirm_password: values.confirmPassword,
          refer_code: referCode,
        },
      });

      if (result?.data?.code === Code.Error) {
        setError(result?.data?.message);

        return;
      }

      router.push(
        `/authentication/wait-verify?email=${encodeURIComponent(String(values.email))}`
      );

      return;
    }

    setError(undefined);
  }, [
    checkEmail,
    checkFullName,
    checkPassword,
    checkReferCode,
    checkUserName,
    referCode,
    router,
    screen,
    submit,
    values,
  ]);

  const nextScreenByEnter = useCallback(
    async (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.code === 'Enter') {
        await nextScreen();
      }
    },
    [nextScreen]
  );

  const renderScreen = useCallback(() => {
    if (screen === Screens.Email) {
      return (
        <FormInput
          key="email"
          label="Điền email của bạn"
          placeholder="Email"
          message={error}
          state={error ? 'error' : 'normal'}
          defaultValue={values.email}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, email: e.target.value }))
          }
          onKeyDown={nextScreenByEnter}
        />
      );
    }

    if (screen === Screens.FullName) {
      return (
        <FormInput
          key="fullName"
          label="Họ và tên của bạn"
          placeholder="Họ và tên"
          message={error}
          state={error ? 'error' : 'normal'}
          defaultValue={values.fullName}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, fullName: e.target.value }))
          }
          onKeyDown={nextScreenByEnter}
        />
      );
    }

    if (screen === Screens.UserName) {
      return (
        <FormInput
          key="userName"
          label="Tên đăng nhập"
          placeholder="Tên đăng nhập"
          description="(Viết liền không dấu và không chứa kí tự đặc biệt)"
          message={error}
          state={error ? 'error' : 'normal'}
          defaultValue={values.userName}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, userName: e.target.value }))
          }
          onKeyDown={nextScreenByEnter}
        />
      );
    }

    if (screen === Screens.Password) {
      return (
        <div className="flex flex-col gap-6">
          <FormInput
            key="password"
            label="Mật khẩu"
            placeholder="********"
            type="password"
            state={error ? 'error' : 'normal'}
            defaultValue={values.password}
            onChange={(e) =>
              setValues((prev) => ({ ...prev, password: e.target.value }))
            }
            onKeyDown={nextScreenByEnter}
          />

          <FormInput
            key="confirmPassword"
            label="Xác nhận lại mật khẩu"
            placeholder="********"
            type="password"
            message={error}
            state={
              // eslint-disable-next-line no-nested-ternary
              error
                ? 'error'
                : values.password &&
                    values.confirmPassword &&
                    values.password === values.confirmPassword
                  ? 'success'
                  : 'normal'
            }
            defaultValue={values.confirmPassword}
            onChange={(e) =>
              setValues((prev) => ({
                ...prev,
                confirmPassword: e.target.value,
              }))
            }
            onKeyDown={nextScreenByEnter}
          />
        </div>
      );
    }

    if (screen === Screens.ReferCode) {
      return (
        <FormInput
          key="referCode"
          label="Mã giới thiệu (để trống nếu bạn không có)"
          placeholder="Điền mã giới thiệu"
          message={error}
          state={error ? 'error' : 'normal'}
          defaultValue={values.referCode}
          onChange={(e) =>
            setValues((prev) => ({ ...prev, referCode: e.target.value }))
          }
          onKeyDown={nextScreenByEnter}
        />
      );
    }

    return null;
  }, [error, screen, values, nextScreenByEnter]);

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-[url('/static/bg3.jpg')]">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900">
          {screen !== Screens.Email ? (
            <p
              className="flex items-center gap-2 cursor-pointer"
              onClick={backToPrevious}
              aria-hidden="true"
            >
              <ArrowLeftIcon className="w-5 h-5" /> Quay lại
            </p>
          ) : (
            // keep this as a placeholder
            <p />
          )}
          <p>{screen}/5</p>
        </div>

        {/* Body */}
        <div className="text-left text-sm leading-5 py-10 w-full sm:w-auto">
          <Link href="/" className="inline-block">
            <img
              src="/static/logo.svg"
              alt="logo"
              className="w-auto h-12 mb-6"
            />
          </Link>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Đăng kí tài khoản
          </h1>

          <p className="mb-14 text-gray-500">
            {screen === Screens.Email ? (
              'Chào mừng bạn đến với WELE'
            ) : (
              <span>
                Bạn đang đăng kí với email{' '}
                <span className="text-gray-900">{values.email}</span>
              </span>
            )}
          </p>

          {/* STEPS */}
          <div className="w-full sm:w-[436px] mb-6">{renderScreen()}</div>

          <Button
            size="x-large"
            className="w-full"
            onClick={nextScreen}
            loading={isChecking || submitting}
          >
            {screen === Screens.ReferCode ? 'Hoàn tất đăng kí' : 'Tiếp tục'}
          </Button>
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-900">
          Bạn đã có tài khoản? &nbsp;
          <Link
            href="/authentication/login"
            className="text-primary hover:text-primary-700"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
