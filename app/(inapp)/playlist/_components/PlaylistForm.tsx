import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { PlaylistAPI } from '@/app/(inapp)/playlist/playlistApi';
import { Input, Modal, Select } from '@/components/common';
import type { ModalProps } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawUserPlaylist } from '@/store/types';

const playlistSchema = z.object({
  name: z.string({ required_error: 'Bắt buộc' }).min(1),
  description: z.string().optional(),
  privacy: z.string({ required_error: 'Bắt buộc' }),
});

type PlaylistFormValues = z.infer<typeof playlistSchema>;

type PlaylistFormProps = {
  editMode?: boolean;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
  data?: RawUserPlaylist;
} & Omit<ModalProps, 'title' | 'okButtonProps' | 'onOk'>;

export function PlaylistForm(props: PlaylistFormProps) {
  const { onCancel, onError, onSuccess, editMode, data, open, ...rest } = props;

  const {
    control,
    reset,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: data?.name,
      description: '',
      privacy: '1',
    },
    resolver: zodResolver(playlistSchema),
  });

  useEffect(() => {
    if (open && !editMode) {
      reset({ name: '', description: '', privacy: '1' });
    }

    if (open && data && editMode) {
      setValue('name', data?.name);
      setValue('description', data?.description ?? '');
      setValue('privacy', String(data?.privacy ?? 1));
    }
  }, [data, editMode, open, reset, setValue]);

  const onSubmit: SubmitHandler<PlaylistFormValues> = async (formData) => {
    const { name, description, privacy } = formData;

    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      editMode ? PlaylistAPI.Update : PlaylistAPI.Create,
      {
        name,
        description,
        privacy,
        ...(editMode ? { id: data?.id } : {}),
      }
    );

    if (res?.data?.code === Code.Error) {
      if (onError) {
        onError(res?.data?.message);
      } else {
        toast.error(res?.data?.message);
      }
    } else {
      const message = editMode ? 'Cập nhật thành công' : 'Tạo mới thành công';

      if (onSuccess) {
        onSuccess(message);
      } else {
        toast.success(message);
      }

      // close modal after success
      onCancel();
    }
  };

  return (
    <Modal
      open={open}
      title={editMode ? 'Cập nhật playlist' : 'Tạo playlist'}
      okText={editMode ? 'Lưu thay đổi' : 'Tạo mới'}
      width="600px"
      onCancel={onCancel}
      // eslint-disable-next-line
      // @ts-ignore
      onOk={handleSubmit(onSubmit)}
      okButtonProps={{ loading: isSubmitting }}
      panelClassName="overflow-visible"
      cancelText="Hủy bỏ"
      {...rest}
    >
      <div className="text-sm flex flex-col gap-6 py-4">
        <FormItem label="Tên" error={errors?.name?.message?.toString()}>
          <Controller
            render={({ field }) => <Input {...field} />}
            name="name"
            control={control}
          />
        </FormItem>

        <FormItem
          label="Mô tả"
          error={errors?.description?.message?.toString()}
        >
          <Controller
            render={({ field }) => <Input {...field} />}
            name="description"
            control={control}
          />
        </FormItem>

        <FormItem
          label="Trạng thái"
          error={errors?.privacy?.message?.toString()}
        >
          <Controller
            render={({ field }) => (
              <Select
                options={[
                  { label: 'Công khai', value: '0' },
                  { label: 'Chỉ mình tôi', value: '1' },
                ]}
                {...field}
              />
            )}
            name="privacy"
            control={control}
          />
        </FormItem>
      </div>
    </Modal>
  );
}
