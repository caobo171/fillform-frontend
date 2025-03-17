import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input, Modal, ModalProps, TextArea } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawAssignment } from '@/store/types';
import DateUtil from '@/services/Date';

const assignmentSchema = z.object({
  name: z.string().min(1),
  content: z.string(),
  startTime: z.string(),
  endTime: z.string(),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

type AssignmentModalProps = {
  editMode?: boolean;
  classId?: string;
  data?: RawAssignment;
  onError: (message: string) => void;
  onSuccess: (message: string, assignment?: RawAssignment) => void;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;

export function AssignmentModal(props: AssignmentModalProps) {
  const { onCancel, onError, onSuccess, classId, editMode, data, ...rest } =
    props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: data?.name,
      content: data?.content,
      startTime: DateUtil.dateToInputDatetime(data?.start_time),
      endTime: DateUtil.dateToInputDatetime(data?.end_time),
    },
    resolver: zodResolver(assignmentSchema),
  });

  const handleCancel = () => {


    onCancel();
  };

  const onSubmit: SubmitHandler<AssignmentFormValues> = async (formData) => {
    const { name, content, startTime, endTime } = formData;

    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      `/api/weleclass.assignment/${editMode ? 'update' : 'create'}`,
      {
        name,
        content,
        start_time: new Date(startTime).getTime() / 1000,
        end_time: new Date(endTime).getTime() / 1000,
        class_id: classId,
        user_ids: '',
        ...(editMode ? { id: data?.id } : {}),
      }
    );

    if (res?.data?.code === Code.Error) {
      onError(res?.data?.message);
    } else {
      onSuccess(
        editMode ? 'Updated successfully' : 'New assignment added!',
        res?.data?.assignment
      );
    }
  };

  return (
    <Modal
      title={editMode ? 'Update assignment' : 'Add new assignment'}
      okText={editMode ? 'Save changes' : 'Add assignment'}
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
          label="Description"
          error={errors?.content?.message?.toString()}
        >
          <Controller
            render={({ field }) => <TextArea {...field} />}
            name="content"
            control={control}
          />
        </FormItem>

        <div className="flex gap-6">
          <FormItem
            label="Start time"
            error={errors?.startTime?.message?.toString()}
            className="w-1/2"
          >
            <Controller
              render={({ field }) => <Input type="datetime-local" {...field} />}
              name="startTime"
              control={control}
            />
          </FormItem>

          <FormItem
            label="End time"
            error={errors?.endTime?.message?.toString()}
            className="w-1/2"
          >
            <Controller
              render={({ field }) => <Input type="datetime-local" {...field} />}
              name="endTime"
              control={control}
            />
          </FormItem>
        </div>
      </div>
    </Modal>
  );
}
