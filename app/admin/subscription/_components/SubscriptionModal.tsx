import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input, Modal, ModalProps, Select, TextArea } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawSubscription } from '@/store/types';
import DateUtil from '@/services/Date';

const subscriptionSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  name: z.string(),
  status: z.number(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

type SubscriptionModalProps = {
  editMode?: boolean;
  classId?: string;
  data?: RawSubscription;
  onError: (message: string) => void;
  onSuccess: (message: string, subscription?: RawSubscription) => void;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;

export function SubscriptionModal(props: SubscriptionModalProps) {
  const { onCancel, onError, onSuccess, classId, editMode, data, ...rest } =
    props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      startDate: DateUtil.dateToInputDate(data?.start_date || 0),
      endDate: DateUtil.dateToInputDate(data?.end_date || 0),
      status: data?.status || 0,
      name: data?.name,
    },
    resolver: zodResolver(subscriptionSchema),
  });

  const handleCancel = () => {
    reset();

    onCancel();
  };

  const onSubmit: SubmitHandler<SubscriptionFormValues> = async (formData) => {
    const { startDate, endDate } = formData;

    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      `/api/subscription/${editMode ? 'update' : 'create'}`,
      {
        start_date: new Date(startDate).getTime() / 1000,
        end_date: new Date(endDate).getTime() / 1000,
        status: formData.status,
        name: formData.name,
        ...(editMode ? { id: data?.id } : {}),
      }
    );

    if (res?.data?.code === Code.Error) {
      onError(res?.data?.message);
    } else {
      onSuccess(
        editMode ? 'Updated successfully' : 'New subscription added!',
        res?.data?.subscription
      );
    }
  };

  return (
    <Modal
      title={editMode ? 'Update subscription' : 'Add new subscription'}
      okText={editMode ? 'Save changes' : 'Add subscription'}
      width="600px"
      onCancel={handleCancel}
      // eslint-disable-next-line
      // @ts-ignore
      onOk={handleSubmit(onSubmit)}
      okButtonProps={{ loading: isSubmitting }}
      panelClassName="overflow-visible"
      {...rest}
    >
      <div className="text-sm flex flex-col gap-6 py-4">
        <FormItem label="Name" error={errors?.name?.message?.toString()}>
          <Controller
            render={({ field }) => <Input {...field} />}
            name="name"
            control={control}
          />
        </FormItem>
        <FormItem
          label="Trạng thái"
          error={errors?.status?.message?.toString()}
        >
          <Controller
            render={({ field }) => (
              <Select
                options={[
                  { label: 'Free trial (Chưa thanh toán)', value: 0 },
                  { label: 'Đã thanh toán', value: 1 },
                  { label: 'Huỷ bỏ tự động đăng ký', value: -1 },
                ]}
                {...field}
              />
            )}
            name="status"
            control={control}
          />
        </FormItem>
        <div className="flex gap-6">


          <FormItem
            label="Start date"
            error={errors?.startDate?.message?.toString()}
            className="w-1/2"
          >
            <Controller
              render={({ field }) => <Input type="date" {...field} />}
              name="startDate"
              control={control}
            />
          </FormItem>

          <FormItem
            label="End date"
            error={errors?.endDate?.message?.toString()}
            className="w-1/2"
          >
            <Controller
              render={({ field }) => <Input type="date" {...field} />}
              name="endDate"
              control={control}
            />
          </FormItem>
        </div>
      </div>
    </Modal>
  );
}
