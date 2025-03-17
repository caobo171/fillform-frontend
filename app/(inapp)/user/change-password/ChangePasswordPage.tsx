'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import { Button, Input } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';

const passwordSchema = z.object({
  presentPassword: z.string(),
  password: z.string(),
  confirmPassword: z.string(),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function ChangePasswordPage() {
  const { trigger: saveChange } = useSWRMutation(
    '/api/me/change.password',
    Fetch.postFetcher.bind(Fetch)
  );

  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({ resolver: zodResolver(passwordSchema) });

  const onSubmit: SubmitHandler<PasswordFormValues> = async (formData) => {
    try {
      const { presentPassword, password, confirmPassword } = formData;

      const result: AnyObject = await saveChange({
        payload: {
          present_password: presentPassword,
          password,
          confirm_password: confirmPassword,
        },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result.data.message);
      } else {
        await MeFunctions.logout();

        toast.success('Cập nhật mật khẩu thành công! Tiến hành đăng nhập lại');

        router.push('/authentication/login');
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
    <div className="bg-white rounded-lg p-6">
      <div className="text-sm text-gray-900 w-1/2">
        <div className="mb-8">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Thay đổi mật khẩu
          </h1>

          <p className="mt-2 text-sm text-gray-700">
            WELE khuyến khích thay đổi mật khẩu thường xuyên để nâng cao tính
            bảo mật cho tài khoản của bạn.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <FormItem
            label="Mật khẩu hiện tại"
            className="mb-6"
            error={errors?.presentPassword?.message}
          >
            <Controller
              render={({ field }) => (
                <Input {...field} size="large" type="password" />
              )}
              name="presentPassword"
              control={control}
            />
          </FormItem>

          <FormItem
            label="Mật khẩu mới"
            className="mb-6"
            error={errors?.password?.message}
          >
            <Controller
              render={({ field }) => (
                <Input {...field} size="large" type="password" />
              )}
              name="password"
              control={control}
            />
          </FormItem>

          <FormItem
            label="Xác nhận mật khẩu mới"
            className="mb-6"
            error={errors?.confirmPassword?.message}
          >
            <Controller
              render={({ field }) => (
                <Input {...field} size="large" type="password" />
              )}
              name="confirmPassword"
              control={control}
            />
          </FormItem>

          <Button type="solid" htmlType="submit" loading={isSubmitting}>
            Lưu thay đổi
          </Button>
        </form>
      </div>
    </div>
  );
}
