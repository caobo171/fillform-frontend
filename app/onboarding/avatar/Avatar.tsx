'use client';

import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FileWithPath, useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { Button } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Fetch from '@/lib/core/fetch/Fetch';
import { MeFunctions } from '@/store/me/functions';
import { MeHook } from '@/store/me/hooks';

type FileWithPathAndPreview = {
  preview: string;
} & FileWithPath;

export function AvatarUpload() {
  const me = MeHook.useMe();

  const router = useRouter();

  const { trigger: saveAvatar, isMutating: isSavingAvatar } = useSWRMutation(
    '/api/me/change.avatar',
    Fetch.postFetcher.bind(Fetch)
  );

  const [avatarPreview, setAvatarPreview] = useState<FileWithPathAndPreview>();

  const [avatarFile, setAvatarFile] = useState<File>();

  const onDrop = async (acceptedFiles: File[]) => {
    setAvatarPreview(
      Object.assign(acceptedFiles[0], {
        preview: URL.createObjectURL(acceptedFiles[0]),
      })
    );

    setAvatarFile(acceptedFiles[0]);
  };

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const saveChangeAvatar = async () => {
    try {
      await saveAvatar({ payload: { image: avatarFile } });

      MeFunctions.loadProfile();

      router.push('/onboarding/complete');
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err?.message, { position: 'top-center' });
      }
    }
  };

  const removeAvatar = () => {
    setAvatarFile(undefined);

    setAvatarPreview(undefined);
  };

  return (
    <div className="w-screen h-screen bg-cover bg-center bg-mesh-gradient">
      <div className="relative bg-white flex flex-col h-full justify-between items-start xl:w-1/2 2xl:w-[736px] px-6 sm:px-[150px] py-10">
        {/* Top Header */}
        <div className="flex w-full items-center justify-between text-sm text-gray-900">
          <Link
            href="/onboarding/bio"
            className="flex items-center gap-2 cursor-pointer"
            aria-hidden="true"
          >
            <ArrowLeftIcon className="w-5 h-5" /> Quay lại
          </Link>
          <p>7/7</p>
        </div>

        {/* Body */}
        <div className="text-left text-base py-10 w-full sm:w-auto">
          <div className="mb-6">
            <img
              src="/static/svg/camera.svg"
              className="h-[56px] w-auto"
              alt="icon"
            />
          </div>

          <h1 className="text-2xl leading-8 font-medium text-gray-900 mb-2">
            Tải ảnh đại diện
          </h1>

          <p className="mb-6 text-gray-500">
            Đặt một chiếc ảnh thật tuyệt vời làm ảnh đại diện thôi nào
          </p>

          {!!me && (
            <div className="flex items-center gap-3 mb-8">
              {avatarPreview ? (
                <span
                  className="w-[100px] h-[100px] rounded-full overflow-hidden bg-cover bg-center ring-2 ring-gray-100"
                  style={{ backgroundImage: `url(${avatarPreview.preview})` }}
                >
                  <img
                    src={avatarPreview.preview}
                    className="hidden"
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
                  size={100}
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
                <Button type="secondary" rounded onClick={removeAvatar}>
                  Hủy
                </Button>
              )}
            </div>
          )}

          <Button
            size="large"
            loading={isSavingAvatar}
            onClick={saveChangeAvatar}
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
