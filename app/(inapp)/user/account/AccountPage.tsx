'use client';

import { CircleStackIcon } from '@heroicons/react/24/solid';
import { zodResolver } from '@hookform/resolvers/zod';
import { difference } from 'lodash';
import React, { useEffect, useMemo, useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import { Alert, Button, Input, Select, TextArea } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import Avatar from '@/components/ui/Avatar';
import { Code } from '@/core/Constants';
import { useCities } from '@/hooks/place';
import Fetch from '@/lib/core/fetch/Fetch';
import DateUtil from '@/services/Date';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';
import { MeHook } from '@/store/me/hooks';

type FileWithPathAndPreview = {
  preview: string;
} & FileWithPath;

const GenderOptions = [
  {
    label: 'Nữ',
    value: 'female',
  },
  {
    label: 'Nam',
    value: 'male',
  },
  {
    label: 'Khác',
    value: 'other',
  },
];

const accountSchema = z.object({
  username: z
    .string({ required_error: 'Tên đăng nhập không được bỏ trống' })
    .min(1, { message: 'Tên đăng nhập không được bỏ trống' })
    // regex only allow lowercase, uppercase characters and numbers
    .refine((val: string) => /^[a-zA-Z0-9]+$/.test(val), {
      message:
        'Tên đăng nhập chỉ được sử dụng số, chữ hoa và chữ thường (không dấu viết liền nhau)',
    }),

  email: z
    .string({ required_error: 'Email không được bỏ trống' })
    .min(1, { message: 'Email không được bỏ trống' })
    .email({ message: 'Định dạng Email không đúng' }),

  fullname: z
    .string({ required_error: 'Họ và Tên không được bỏ trống' })
    .min(1, { message: 'Họ và Tên không được bỏ trống' }),

  facebook: z.any().optional(),
  address: z.any().optional(),
  city: z.any().optional(),
  district: z.any().optional(),
  ward: z.any().optional(),
  phone: z.any().optional(),
  sex: z.any().optional(),
  description: z.any().optional(),
  dob: z.any().optional(),
  school: z.any().optional(),
  major: z.any().optional(),
  company: z.any().optional(),
  job_position: z.any().optional(),
});

type AccountFormValues = z.infer<typeof accountSchema>;

const optionalFields = [
  'facebook',
  'address',
  'city',
  'district',
  'ward',
  'phone',
  'sex',
  'description',
  'dob',
  'school',
  'major',
  'company',
  'job_position',
];

export function AccountPage() {
  const { trigger: saveAvatar, isMutating: isSavingAvatar } = useSWRMutation(
    '/api/me/change.avatar',
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: saveInfos } = useSWRMutation(
    '/api/me/update.info',
    Fetch.postFetcher.bind(Fetch)
  );

  const { cities } = useCities();

  const { mutate } = useSWRConfig();

  const me = MeHook.useMe();

  const [avatarPreview, setAvatarPreview] = useState<FileWithPathAndPreview>();

  const [avatarFile, setAvatarFile] = useState<File>();

  const [numberOfFieldWithCoinEarned, setNumberOfFieldWithCoinEarned] =
    useState<number>(0);

  const ableToEarnMoreCoin = useMemo(() => {
    if (!me?.data) {
      return [];
    }

    let fieldWithCoinEarned = Object.keys(me?.data?.coin_fields ?? []);

    setNumberOfFieldWithCoinEarned(fieldWithCoinEarned.length);

    fieldWithCoinEarned = fieldWithCoinEarned.map((item) =>
      item.replace('is_updated_', '')
    );

    return difference(optionalFields, fieldWithCoinEarned);
  }, [me]);

  const {
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormValues>({ resolver: zodResolver(accountSchema) });

  useEffect(() => {
    if (me) {
      setValue('username', me.username);
      setValue('fullname', me.fullname);
      setValue('email', me.email);
      setValue('facebook', me.facebook);
      setValue('phone', me.phone);
      setValue('sex', me.sex);
      setValue('description', me.description);
      setValue('address', me.address);
      setValue('city', me.city);
      setValue('district', me.district);
      setValue('ward', me.ward);
      setValue('dob', DateUtil.dateToInputDatetime(me.dob, 10));
      setValue('school', me.school);
      setValue('major', me.major);
      setValue('company', me.company);
      setValue('job_position', me.job_position);
    }
  }, [me, setValue]);

  const cityNames = useMemo(
    () => [...(cities?.map((city) => city.name) ?? []), 'Nước ngoài'],
    [cities]
  );

  const onDrop = async (acceptedFiles: File[]) => {
    setAvatarPreview(
      Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0]),
      })
    );

    setAvatarFile(acceptedFiles[0]);
  };

  const saveChangeAvatar = async () => {
    try {
      await saveAvatar({ payload: { image: avatarFile } });

      toast.success('Cập nhật thành công');

      await MeFunctions.loadProfile();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err?.message);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const onSubmit: SubmitHandler<AccountFormValues> = async (formData) => {
    try {
      let dob;

      if (formData.dob) {
        dob = new Date(formData.dob).getTime() / 1000;
      }

      const result: AnyObject = await saveInfos({
        payload: { ...formData, dob },
      });

      if (result?.data?.code === Code.Error) {
        toast.error(result.data.message);
      } else {
        toast.success('Cập nhật tài khoản thành công!');

        MeFunctions.loadProfile();

        mutate('/api/me/profile');

        const newNumberOfFieldWithCoinEarned = Object.keys(
          result?.data?.data?.coin_fields ?? []
        ).length;

        const earnedCoin =
          (newNumberOfFieldWithCoinEarned - numberOfFieldWithCoinEarned) * 5;

        if (earnedCoin) {
          toast.info(
            <>
              <h4 className="text-base font-medium text-green-500">
                +{earnedCoin} coins
              </h4>
              <p>Chúc mừng bạn đã được +{earnedCoin} coins vào Ví 2</p>
            </>,
            {
              autoClose: 15000,
              icon: <CircleStackIcon className="w-5 h-5 text-orange-500" />,
            }
          );
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  const removeAvatar = () => {
    setAvatarFile(undefined);

    setAvatarPreview(undefined);
  };

  return (
    <>
      {!!ableToEarnMoreCoin?.length && (
        <Alert
          type="info"
          className="mb-6"
          titleClass="font-normal"
          title={
            <span>
              Bạn sẽ nhận được <span className="font-bold">5 coins</span> cho
              mỗi trường thông tin được cập nhật{' '}
              <i>(chỉ áp dụng cho lần cập nhật đầu tiên đối với mỗi trường)</i>
            </span>
          }
        />
      )}

      <div className="bg-white rounded-lg p-6">
        <div className="text-sm text-gray-900 w-2/3">
          <div className="mb-8">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              Thông tin tài khoản
            </h1>

            <p className="mt-2 text-sm text-gray-700">
              Cập nhật đầy đủ thông tin của bạn để có được sự hỗ trợ tốt nhất
              đến từ WELE bạn nhé.
            </p>
          </div>

          {!!me && (
            <div className="inline-flex justify-center items-center gap-3 mb-6">
              {avatarPreview ? (
                <span className="w-20 h-20 rounded-full overflow-hidden">
                  <img
                    src={avatarPreview.preview}
                    className="h-full w-auto"
                    alt={avatarPreview.name}
                    // Revoke data uri after image is loaded
                    onLoad={() => {
                      URL.revokeObjectURL(avatarPreview.preview);
                    }}
                  />
                </span>
              ) : (
                <Avatar
                  user={me}
                  size={80}
                  unlink
                  textClassName="text-2xl"
                  className="cursor-auto"
                />
              )}

              <div className="inline-flex flex-col gap-2" {...getRootProps()}>
                <input {...getInputProps()} />
                <Button type="secondary" rounded>
                  Tải ảnh mới
                </Button>
              </div>

              {avatarPreview && (
                <>
                  <Button
                    type="secondary"
                    rounded
                    loading={isSavingAvatar}
                    onClick={saveChangeAvatar}
                  >
                    Lưu
                  </Button>

                  <Button type="secondary" rounded onClick={removeAvatar}>
                    Hủy
                  </Button>
                </>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <FormItem
              label="Tên đăng nhập"
              className="mb-6"
              error={errors?.username?.message}
            >
              <Controller
                render={({ field }) => <Input {...field} size="large" />}
                name="username"
                control={control}
              />
            </FormItem>

            <FormItem
              label="Email"
              className="mb-6"
              error={errors?.email?.message}
            >
              <Controller
                render={({ field }) => <Input {...field} size="large" />}
                name="email"
                control={control}
              />
            </FormItem>

            <FormItem
              label="Họ và tên"
              className="mb-6"
              error={errors?.fullname?.message}
            >
              <Controller
                render={({ field }) => <Input {...field} size="large" />}
                name="fullname"
                control={control}
              />
            </FormItem>

            <div className="w-full h-[1px] bg-gray-100 mb-6" />

            <div className="flex items-center gap-6">
              <FormItem
                label="Ngày tháng năm sinh"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('dob') ? 5 : 0}
                coinBlockClassName="right-10"
              >
                <Controller
                  render={({ field }) => (
                    <Input {...field} size="large" type="date" />
                  )}
                  name="dob"
                  control={control}
                />
              </FormItem>

              <FormItem
                label="Giới tính"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('sex') ? 5 : 0}
                coinBlockClassName="right-8"
              >
                <Controller
                  render={({ field }) => (
                    <Select
                      placeholder="---"
                      options={GenderOptions}
                      {...field}
                      className="w-full"
                      size="large"
                    />
                  )}
                  name="sex"
                  control={control}
                />
              </FormItem>
            </div>

            <div className="flex gap-6">
              <FormItem
                label="Thành phố (tỉnh)"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('city') ? 5 : 0}
                coinBlockClassName="right-8"
              >
                <Controller
                  render={({ field }) => {
                    const canSelectCity =
                      !field.value || cityNames.includes(field.value);

                    return canSelectCity ? (
                      <Select
                        placeholder="---"
                        options={cityNames.map((city) => ({
                          label: city,
                          value: city,
                        }))}
                        {...field}
                        size="large"
                      />
                    ) : (
                      <Input {...field} size="large" />
                    );
                  }}
                  name="city"
                  control={control}
                />
              </FormItem>

              <FormItem
                label="Quận (huyện)"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('district') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="district"
                  control={control}
                />
              </FormItem>
            </div>

            <div className="flex gap-6">
              <FormItem
                label="Phường (xã)"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('ward') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="ward"
                  control={control}
                />
              </FormItem>

              <FormItem
                label="Địa chỉ (tên đường)"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('address') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="address"
                  control={control}
                />
              </FormItem>
            </div>

            <div className="flex gap-6">
              <FormItem
                label="Công ty"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('company') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="company"
                  control={control}
                />
              </FormItem>

              <FormItem
                label="Chức vụ trong công ty"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('job_position') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="job_position"
                  control={control}
                />
              </FormItem>
            </div>

            <div className="flex gap-6">
              <FormItem
                label="Trường đại học / cao đẳng"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('school') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="school"
                  control={control}
                />
              </FormItem>

              <FormItem
                label="Chuyên ngành"
                className="mb-6 w-1/2"
                coinNumber={ableToEarnMoreCoin.includes('major') ? 5 : 0}
              >
                <Controller
                  render={({ field }) => <Input {...field} size="large" />}
                  name="major"
                  control={control}
                />
              </FormItem>
            </div>

            <FormItem
              label="Số điện thoại"
              className="mb-6"
              coinNumber={ableToEarnMoreCoin.includes('phone') ? 5 : 0}
            >
              <Controller
                render={({ field }) => <Input {...field} size="large" />}
                name="phone"
                control={control}
              />
            </FormItem>

            <FormItem
              label="Link Facebook (trang cá nhân)"
              className="mb-6"
              coinNumber={ableToEarnMoreCoin.includes('facebook') ? 5 : 0}
            >
              <Controller
                render={({ field }) => <Input {...field} size="large" />}
                name="facebook"
                control={control}
              />
            </FormItem>

            <FormItem
              label="Mô tả (sở thích, tính cách...)"
              className="mb-6"
              coinNumber={ableToEarnMoreCoin.includes('description') ? 5 : 0}
            >
              <Controller
                render={({ field }) => <TextArea {...field} />}
                name="description"
                control={control}
              />
            </FormItem>

            <Button type="solid" loading={isSubmitting}>
              Lưu thông tin
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
