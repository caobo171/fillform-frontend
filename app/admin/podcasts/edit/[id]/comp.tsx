'use client';

import { MusicalNoteIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useEffect, useMemo } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { WarningWithAccentBorder } from '@/components/alert/WarningWithAccentBorder';
import {
  CheckboxGroup,
  FileUploader,
  FormCard,
  Input,
  RadioGroup,
  TextArea,
  TextEditor,
} from '@/components/form';
import { FormItem } from '@/components/form/FormItem';
import { Container } from '@/components/layout/container/container';
import GenerateHintButtons from '@/components/podcast.hint/GenerateHintButtons';
import { Button } from '@/components/ui/Button';
import Meta from '@/components/ui/Meta';
import Constants, { Code, OtherSource } from '@/core/Constants';
import hintHelpers from '@/helpers/hint';
import { useCollections } from '@/hooks/collection';
import { useSources } from '@/hooks/source';
import { useMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import ACL from '@/services/ACL';
import DateUtil from '@/services/Date';
import { RawPodcast } from '@/store/types';
import { useTranscriber } from '@/hooks/transcriber/useTranscriber';
import { AudioManager } from '@/components/transcriber/AudioManager';
import Transcript from '@/components/transcriber/Transcript';
import { MeHook } from '@/store/me/hooks';

const podcastSchema = z.object({
  name: z.string().min(1),
  sub_name: z
    .string()
    .refine((val) => val !== '' && !Number.isNaN(Number(val)), {
      message: 'Invalid number',
    })
    .optional(),
  description: z.string().optional(),
  result: z.string().min(1),
  hint: z.array(z.number()),
  hintText: z.string(),
  privacy: z.string(),
  post_date: z.string().optional(),
  source_key: z.string(),
  collections: z.array(z.string()).optional(),
  level: z.string().optional(),
  audio: z.union([z.array(z.any()), z.array(z.string())]),
  image: z.union([z.array(z.any()), z.array(z.string())]),
});

type PodcastFormValues = z.infer<typeof podcastSchema>;

function Edit({ podcast }: { podcast: RawPodcast }) {

  const data = useSources();
  const me = useMe();
  const sub = MeHook.useSubscription();
  const sourceOptions = [...(data.data?.sources || []), OtherSource].map(
    (item) => ({ value: item.id.toString(), label: item.name })
  );

  const collections = (useCollections().data?.collections || []).map((e) => ({
    value: e.id.toString(),
    label: e.name,
  }));

  const {
    getParagraphWithHintIndexes,
    formatParagraph,
    getErrorWords,
    specialPunctuations,
  } = hintHelpers;

  const [isPreventEdit, setIsPreventEdit] = React.useState(false);
  const [errorWords, setErrorWords] = React.useState<string[]>([]);

  console.log('podcast', podcast);
  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PodcastFormValues>({
    defaultValues: {
      name: podcast.name,
      image: [podcast.image_url],
      audio: [podcast.file_path],
      result: podcast.result,
      post_date: DateUtil.getDatetimeLocalValue(new Date(podcast.since * 1000)),
      hint: podcast.hint,
      hintText: getParagraphWithHintIndexes(podcast.result, podcast.hint),
      privacy: podcast.private.toString(),
      source_key: podcast.source_key ? podcast.source_key.toString() : '0',
      collections: podcast.collections.map((e) => e.toString()),
      sub_name: podcast.sub_name,
      description: podcast.description ? podcast.description : '',
    },
    resolver: zodResolver(podcastSchema),
  });

  const resultValue = useWatch({ control, name: 'result', exact: true });




  // if wanting to edit paragraph, user must click button to generate new hint
  // because old hint is not fit with new paragraph, so we need to check if paragraph is changed
  useEffect(() => {
    if (formatParagraph(resultValue) !== resultValue) {
      setIsPreventEdit(true);
    }
  }, [resultValue]);

  /**
   * @desc Prepare for transcribing audio
   */
  const audioValue = useWatch({ control, name: 'audio', exact: true });
  const fileUrl = audioValue?.[0] instanceof File ? '' : Constants.IMAGE_URL + audioValue[0];
  const file = audioValue?.[0] instanceof File ? audioValue[0] : undefined;
  const transcriber = useTranscriber();
  // Auto use transcript as result if it's empty
  useEffect(() => {
    if (!resultValue && transcriber.output?.chunks.length && !transcriber.isBusy) {
      const result = transcriber.output.text;
      setValue('result', result);
    }
  }, [transcriber.output])

  const onChangeHintIndexes = (indexes: number[]) => {
    const hintText = getParagraphWithHintIndexes(
      formatParagraph(resultValue),
      indexes
    );

    setValue('hint', indexes);

    setValue('hintText', hintText);

    setIsPreventEdit(false);
  };

  const handleCheckData = (): boolean => {
    const words = getErrorWords(formatParagraph(resultValue));
    if (words.length > 0) {
      setErrorWords(words);
      return false;
    }

    return true;
  };


  const onSubmit: SubmitHandler<PodcastFormValues> = async (data) => {

    const resultArray = hintHelpers.splitWords(formatParagraph(resultValue));

    // const analyzeResult = new TranscriptAnalyze(podcast.transcript || []).analyze(Object.values(resultArray) as string[]);


    try {
      const isValid = handleCheckData();
      if (!isValid) return;

      // if ((!podcast.transcript || !podcast.transcript.length) && (transcriber.isBusy || transcriber.isModelLoading)) {
      //   toast.error('Please wait for the transcription to finish');
      //   return
      // }

      const {
        name,
        sub_name,
        privacy,
        hint,
        image,
        audio,
        description,
        post_date,
        source_key,
        collections,
      } = data;



      const res: any = await Fetch.postWithAccessToken<{
        podcast: RawPodcast;
        code: number;
      }>('/api/podcasts/update', {
        id: podcast.id,
        name,
        sub_name,
        result: formatParagraph(resultValue),
        hint: JSON.stringify(hint.sort((a, b) => a - b)),
        description,
        image: image[0],
        audio: audio[0],
        since: post_date,
        privacy: Number(privacy),
        source_key: Number(source_key),
        collection_ids: (collections || []).map((e) => Number(e)).join('_'),
        transcript: transcriber.output?.chunks && transcriber.output.chunks.length ? JSON.stringify(transcriber.output?.chunks) : JSON.stringify(podcast.transcript),
        class_id: 0, // just for test, will be removed soon
        status: 1, // just for test, will be removed soon
        result_array: JSON.stringify(resultArray),
      });

      if (res && res.data) {
        if (res.data.code !== Code.SUCCESS) {
          toast.error(res.data.message);
        } else {
          toast.success('Edit Podcast Successful!');
        }
      }
    } catch (err) {
      console.log(err);
      toast.error('Some errors occurred!');
    }
  };

  const linkCancel = useMemo(() => {
    if (ACL.isAdmin(me.data)) {
      return '/admin';
    }

    if (ACL.isContentCreator(me.data) || Number(sub?.is_paid_premium)) {
      return '/content-creator/podcasts';
    }

    if (ACL.isTeacher(me.data)) {
      return '/teacher/podcasts';
    }

    return '/';
  }, [me.data]);

  return (
    <>
      <Meta title="WELE | Create new podcast" />

      <h3 className="text-xl text-gray-900 mb-6">Edit podcast</h3>

      <form className="flex gap-8 text-sm mb-20">
        {/* left column - for the important fields */}
        <div className="w-2/3 flex flex-col gap-6">
          <FormCard>
            <div className="flex gap-8">
              <FormItem
                label="Name"
                className={ACL.isAdmin(me.data) ? 'w-2/3' : 'w-full'}
                error={errors?.name?.message}
              >
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => <Input type="text" {...field} />}
                />
              </FormItem>

              {ACL.isAdmin(me.data) && (
                <FormItem
                  label="Podcast code"
                  className="w-1/3"
                  error={errors?.sub_name?.message}
                >
                  <Controller
                    name="sub_name"
                    control={control}
                    render={({ field }) => <Input type="text" {...field} />}
                  />
                </FormItem>
              )}
            </div>

            <FormItem label="Description" optional>
              <Controller
                name="description"
                control={control}
                render={({ field }) => <TextEditor {...field} />}
              />
            </FormItem>
          </FormCard>

          <FormCard direction="horizontal">
            <FormItem
              label="Photo"
              className="w-1/2"
              error={errors?.image?.message}
            >
              <Controller
                render={({ field: { onChange, ...props } }) => (
                  <FileUploader
                    icon={<PhotoIcon className="w-10 text-gray-500" />}
                    onChange={onChange}
                    {...props}
                  />
                )}
                name="image"
                control={control}
              />

            </FormItem>

            <FormItem
              label="Audio"
              className="w-1/2"
              error={errors?.audio?.message}
            >
              <Controller
                render={({ field: { onChange, ...props } }) => (
                  <FileUploader
                    accept={{ 'audio/*': [] }}
                    icon={<MusicalNoteIcon className="w-10 text-gray-500" />}
                    onChange={onChange}
                    {...props}
                  />
                )}
                control={control}
                name="audio"
              />
              <AudioManager transcriber={transcriber}
                autoStart={!podcast.transcript || !podcast.transcript.length || !resultValue ? true : false}
                fileUrl={fileUrl}
                file={file}
              />
              <Transcript transcribedData={transcriber.output} />
            </FormItem>
          </FormCard>

          <FormCard>
            <FormItem label="Result" error={errors?.result?.message}>
              <Controller
                render={({ field }) => <TextArea {...field} />}
                name="result"
                control={control}
              />
            </FormItem>

            {errorWords.length > 0 && (
              <WarningWithAccentBorder className="-mt-2" color="red">
                <div>{`Đáp án có những từ sau bị lỗi: ${errorWords.join(', ')}`}</div>
                <div>{`Đáp án chỉ được phép chứa chữ cái, số và các ký tự sau: ${specialPunctuations.join(' ')}`}</div>
              </WarningWithAccentBorder>
            )}

            <WarningWithAccentBorder className="-mt-2">
              Must click the &apos;Generate hint&apos; button after changing the
              result. Slang should be used in &apos;&apos;.
            </WarningWithAccentBorder>

            <div className="flex flex-col gap-3 -mt-4">
              <label className="text-gray-900">Generate hint by</label>
              <GenerateHintButtons
                paragraph={formatParagraph(resultValue)}
                onChangeHintIndexes={onChangeHintIndexes}
                version={2}
              />
            </div>

            <FormItem label="Hint" error={errors?.hintText?.message}>
              <Controller
                render={({ field }) => <TextArea disabled {...field} />}
                name="hintText"
                control={control}
              />
            </FormItem>

          </FormCard>
        </div>

        {/* right column -  for less important fields */}
        <div className="w-1/3 flex flex-col gap-6">
          <FormCard>
            <FormItem
              label="Visibility"
              error={errors?.privacy?.message}
              className="gap-3"
            >
              <Controller
                render={({ field }) => (
                  <RadioGroup
                    {...field}
                    options={[
                      { value: '0', label: 'Everyone' },
                      { value: '1', label: 'Only me' },
                    ]}
                  />
                )}
                name="privacy"
                control={control}
              />
            </FormItem>
          </FormCard>

          <FormCard>
            <FormItem label="Post date" optional>
              <Controller
                render={({ field }) => (
                  <Input type="datetime-local" {...field} />
                )}
                name="post_date"
                control={control}
              />
            </FormItem>
          </FormCard>

          <FormCard>
            <FormItem label="Level" optional className="gap-3">
              <Controller
                render={({ field }) => (
                  <RadioGroup
                    options={[
                      { value: '0', label: 'Dễ' },
                      { value: '1', label: 'Trung bình' },
                      { value: '2', label: 'Khó' },
                    ]}
                    {...field}
                  />
                )}
                name="level"
                control={control}
              />
            </FormItem>
          </FormCard>

          <FormCard>
            <FormItem label="Source" className="gap-3">
              <Controller
                render={({ field: { onChange, ...props } }) => (
                  <RadioGroup
                    direction="vertical"
                    options={sourceOptions}
                    onChange={onChange}
                    {...props}
                  />
                )}
                name="source_key"
                control={control}
              />
            </FormItem>
          </FormCard>

          <FormCard>
            <FormItem label="Collection" optional className="gap-3">
              <Controller
                render={({ field: { onChange, ...props } }) => (
                  <CheckboxGroup
                    options={collections}
                    onChange={onChange}
                    {...props}
                  />
                )}
                name="collections"
                control={control}
              />
            </FormItem>
          </FormCard>
        </div>
      </form>

      <div className="fixed left-0 bottom-0 z-5 w-full pl-52">
        <Container>
          <div className="bg-white py-3 px-6 shadow-light flex items-center" title={isPreventEdit ? "Bạn cần generate hint" : ''}>
            <Button
              className="mr-4"
              size="small"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || isPreventEdit}
            >
              Publish
            </Button>

            <Link href={linkCancel}>
              <Button type="text" size="small">
                Cancel
              </Button>
            </Link>
          </div>
        </Container>
      </div>
    </>
  );
}

export default Edit;
