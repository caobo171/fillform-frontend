import { PhotoIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Checkbox, Input, Modal, TextArea } from '@/components/common';
import type { ModalProps } from '@/components/common';
import { FileUploader } from '@/components/form';
import { FormItem } from '@/components/form/FormItem';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { RawWeleClass } from '@/store/types';

const classSchema = z.object({
  name: z.string().min(1),
  content: z.string(),
  image: z.union([z.array(z.any()), z.array(z.string())]),
  is_public: z.boolean().optional(),
  lost_coin: z.any().optional(),
});

type ClassFormValues = z.infer<typeof classSchema>;

type ClassModalProps = {
  editMode?: boolean;
  onError: (message: string) => void;
  onSuccess: (message: string) => void;
  data?: RawWeleClass;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;

export function ClassModal(props: ClassModalProps) {
  const { onCancel, onError, onSuccess, editMode, data, ...rest } = props;

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { name: data?.name, content: data?.content, image: [], is_public: data?.is_public || false, lost_coin: data?.lost_coin || 0 },
    resolver: zodResolver(classSchema),
  });



  const publicValue = useWatch({ control, name: 'is_public' });

  const handleCancel = () => {
    reset();

    onCancel();
  };
  const onSubmit: SubmitHandler<ClassFormValues> = async (formData) => {
    console.log('formData', formData);
    const { name, content, image, is_public, lost_coin } = formData;

    const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      `/api/wele.class/${editMode ? 'edit' : 'create'}`,
      {
        name,
        content,
        image: image[0],
        is_public: is_public,
        lost_coin: lost_coin,
        ...(editMode ? { id: data?.id } : {}),
      }
    );

    if (res?.data?.code === Code.Error) {
      onError(res?.data?.message);
    } else {
      onSuccess(editMode ? 'Updated successfully!' : 'New class added!');
    }
  };

  return (
    <Modal
      title={editMode ? 'Edit class' : 'Create new class'}
      okText={editMode ? 'Update class' : 'Add class'}
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
          label="Description *"
          error={errors?.content?.message?.toString()}
        >
          <Controller
            render={({ field }) => <TextArea {...field} />}
            name="content"
            control={control}
          />
        </FormItem>

        <FormItem label="Photo" error={errors?.image?.message?.toString()}>
          <Controller
            render={({ field: { onChange, ...p } }) => (
              <FileUploader
                icon={<PhotoIcon className="w-10 text-gray-500" />}
                onChange={onChange}
                {...p}
              />
            )}
            name="image"
            control={control}
          />
        </FormItem>


        <div className="flex flex-col gap-4 mb-6 px-2 py-4 rounded-lg bg-gray-50">
          {!editMode && (


            <Controller
              render={({ field: { onChange, ...p } }) => (

                <Checkbox
                  className="items-start gap-3"
                  {...p}
                  onChange={onChange}
                >
                  <div className="flex-1 flex flex-col gap-1 mt-[-4px]">
                    <p className="text-gray-900 font-medium">Make class Public</p>

                    <p className="text-gray-500">
                      Set public will make class visible to all students, so
                      everyone can join your class. You can set a join fee below.

                    </p>

                    <p className="text-gray-500 mt-8">
                      Public and Private status of class cannot be changed
                    </p>
                  </div>
                </Checkbox>

              )}
              name="is_public"
              control={control}
            />

          )}


          {
            publicValue && (
              <div className="flex flex-col gap-2 pl-7">
                <p className="text-gray-500">
                  This is the subscription fee. Everyone has to pay monthly to
                  maintain class (only apply for Public class).
                </p>

                <FormItem label="Lost coin" error={errors?.name?.message?.toString()}>
                  <Controller
                    render={({ field }) => <Input {...field} />}
                    name="lost_coin"
                    control={control}
                  />
                </FormItem>


              </div>
            )
          }

        </div>
      </div>
    </Modal>
  );
}
