import { PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import { AxiosResponse } from 'axios';
import React, { useCallback, useEffect, useMemo } from 'react';
import {
  Controller,
  SubmitHandler,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';
import { z } from 'zod';

import { Type } from '@/app/(inapp)/challenges/challengeConstant';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { PodcastSearchBox } from '@/app/admin/challenges/_components/PodcastSearchBox';
import { ChallengeApi } from '@/app/admin/challenges/challengeApi';
import { usePodcastWithIds } from '@/app/admin/challenges/challengeHook';
import { Input, Modal, ModalProps, TextArea } from '@/components/common';
import { FileUploader, RadioGroup } from '@/components/form';
import { FormItem } from '@/components/form/FormItem';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { RawPodcast } from '@/store/types';

const challengeSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  image: z.union([z.array(z.any()), z.array(z.string())]),
  rewardCoin: z.union([z.string(), z.number()]).optional(),
  lostCoin: z.union([z.string(), z.number()]).optional(),
  timeOption: z.string().optional(),
  days: z.union([z.string(), z.number()]).optional(),
  podcasts: z
    .array(
      z.object({
        pId: z.number(),
        name: z.string(),
        image: z.string(),
        point: z.union([z.string(), z.number()]),
      })
    )
    .optional(),
});

type ChallengeFormValues = z.infer<typeof challengeSchema>;

type ChallengeFormProps = {
  editMode?: boolean;
  data?: RawChallenge;
  reloadChallenges: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;

export function AddEditForm(props: ChallengeFormProps) {
  const { onCancel, editMode, data, reloadChallenges, ...rest } = props;

  const { trigger } = useSWRMutation(
    editMode ? ChallengeApi.Update : ChallengeApi.Create,
    Fetch.postFetcher.bind(Fetch)
  );

  const podcastIds = useMemo(
    () => data?.podcasts_data?.map((p) => p.podcast_id),
    [data?.podcasts_data]
  );

  const { data: podcastList } = usePodcastWithIds(podcastIds);

  const {
    control,
    reset,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(challengeSchema),
  });

  const {
    fields: podcasts,
    prepend: prependPodcast,
    remove: removePodcast,
  } = useFieldArray({ name: 'podcasts', control });

  const timeOptionValue = useWatch({ name: 'timeOption', control });

  useEffect(() => {
    if (!data || !rest.open) {
      reset();

      removePodcast();

      setValue('timeOption', Type.TimeRange);

      return;
    }

    setValue('name', data.name);
    setValue('description', data.description);
    setValue('rewardCoin', data.reward_coin);
    setValue('lostCoin', data.lost_coin);
    setValue('startTime', Helper.dateToInputDate(data?.data?.start_time));
    setValue('endTime', Helper.dateToInputDate(data?.data?.end_time));
    setValue('image', [data.image_url]);

    if (data?.type === Type.TimeLimit) {
      setValue('timeOption', Type.TimeLimit);

      setValue('days', Math.floor(Number(data?.data?.time_limit) / 86400));
    } else {
      setValue('timeOption', Type.TimeRange);
    }

    const remapPodcasts = podcastList.map((item: RawPodcast) => {
      const point =
        data?.podcasts_data?.find((p) => p.podcast_id === item.id)?.point ?? 0;

      return { pId: item.id, name: item.name, point, image: item.image_url };
    });

    setValue('podcasts', remapPodcasts);
  }, [data, rest.open, setValue, reset, podcastList, removePodcast]);

  const handleCancel = () => {
    reset();

    onCancel();
  };

  const onSubmit: SubmitHandler<ChallengeFormValues> = useCallback(
    async (formData) => {
      const {
        name,
        description,
        startTime,
        endTime,
        image,
        timeOption,
        days,
        podcasts: formPodcasts,
        rewardCoin,
        lostCoin,
      } = formData;

      const timeRange = {
        start_time: new Date(startTime || 0).getTime() / 1000,
        end_time: new Date(endTime || 0).getTime() / 1000,
      };

      const podcastsData = (formPodcasts ?? []).map((item) => ({
        podcast_id: item.pId,
        point: item.point,
      }));

      const res: AnyObject = await trigger({
        payload: {
          name,
          description,
          image: image[0],
          reward_coin: rewardCoin,
          lost_coin: lostCoin,
          time_limit:
            timeOption === Type.TimeLimit ? Number(days) * 86400 : null,
          time_range:
            timeOption === Type.TimeRange ? JSON.stringify(timeRange) : null,
          podcasts_data: JSON.stringify(podcastsData),
          ...(editMode ? { id: data?.id } : {}),
        },
      });

      if (res?.data?.code === Code.Error) {
        toast.error(res?.data?.message);
      } else {
        toast.success(editMode ? `Updated ${name}` : `Added ${name}`);

        reloadChallenges();

        onCancel();
      }
    },
    [data?.id, editMode, reloadChallenges, onCancel, trigger]
  );

  const onSelectPodcast = useCallback(
    (val: number, podcast?: RawPodcast) => {
      // eslint-disable-next-line
      // @ts-ignore
      const isExisted = !!podcasts.find((item) => item?.pId === val);

      if (isExisted) {
        toast.warning('Podcast already added');

        return;
      }

      if (podcast) {
        prependPodcast({
          // eslint-disable-next-line
          // @ts-ignore
          name: podcast.name,
          point: 10,
          pId: podcast.id,
          image: podcast.image_url,
        });
      }
    },
    [podcasts, prependPodcast]
  );

  return (
    <Modal
      title={editMode ? 'Update challenge' : 'Add new challenge'}
      okText={editMode ? 'Save changes' : 'Add challenge'}
      width="800px"
      onCancel={handleCancel}
      // eslint-disable-next-line
      // @ts-ignore
      onOk={handleSubmit(onSubmit)}
      okButtonProps={{ loading: isSubmitting }}
      panelClassName="overflow-visible"
      {...rest}
    >
      <div className="text-sm flex flex-col gap-6 py-4 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
        <FormItem label="Name" error={errors?.name?.message?.toString()}>
          <Controller
            render={({ field }) => <Input {...field} />}
            name="name"
            control={control}
          />
        </FormItem>

        <FormItem
          label="Description"
          error={errors?.description?.message?.toString()}
        >
          <Controller
            render={({ field }) => <TextArea {...field} />}
            name="description"
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

        <div className="flex gap-6">
          <FormItem label="Join fee (numer of coins)" className="w-1/2">
            <Controller
              render={({ field }) => <Input type="number" {...field} />}
              name="lostCoin"
              control={control}
            />
          </FormItem>

          <FormItem label="Reward (number of coins)" className="w-1/2">
            <Controller
              render={({ field }) => <Input type="number" {...field} />}
              name="rewardCoin"
              control={control}
            />
          </FormItem>
        </div>

        <div className="flex flex-col gap-6 p-4 rounded-lg bg-gray-50">
          <Controller
            render={({ field }) => (
              <RadioGroup
                options={[
                  {
                    label: 'Specify time range',
                    value: Type.TimeRange,
                  },
                  { label: 'Limit time', value: Type.TimeLimit },
                ]}
                {...field}
              />
            )}
            name="timeOption"
            control={control}
          />

          {timeOptionValue === Type.TimeLimit && (
            <div className="flex items-center gap-2">
              <FormItem label="Number of days" className="w-1/2">
                <Controller
                  render={({ field }) => <Input type="number" {...field} />}
                  name="days"
                  control={control}
                />
              </FormItem>
            </div>
          )}

          {timeOptionValue === Type.TimeRange && (
            <div className="flex gap-6">
              <FormItem
                label="Start time"
                error={errors?.startTime?.message?.toString()}
                className="w-1/2"
              >
                <Controller
                  render={({ field }) => (
                    <Input type="datetime-local" {...field} />
                  )}
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
                  render={({ field }) => (
                    <Input type="datetime-local" {...field} />
                  )}
                  name="endTime"
                  control={control}
                />
              </FormItem>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-4 rounded-lg bg-gray-50">
          <PodcastSearchBox onSelect={onSelectPodcast} />

          <div className="flex flex-col gap-1">
            {podcasts.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-1 px-2 rounded-lg bg-white"
              >
                <div className="flex-1 flex items-center gap-2">
                  <div
                    className="h-8 w-8 rounded bg-cover bg-center"
                    style={{
                      // eslint-disable-next-line
                      // @ts-ignore
                      backgroundImage: `url(${Constants.IMAGE_URL}${podcasts[index]?.image})`,
                    }}
                  />
                  {/* eslint-disable-next-line */}
                  {/* @ts-ignore*/}
                  {podcasts[index]?.name}
                </div>

                <Controller
                  render={({ field }) => (
                    <Input
                      className="w-[80px]"
                      inputClassName="w-full"
                      type="number"
                      {...field}
                    />
                  )}
                  name={`podcasts.${index}.point`}
                  control={control}
                />

                <div
                  aria-hidden="true"
                  className="group w-8 h-8 rounded-md hover:bg-gray-100 cursor-pointer flex items-center justify-center"
                  onClick={() => removePodcast(index)}
                >
                  <XMarkIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}
