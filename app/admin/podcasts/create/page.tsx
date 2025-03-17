'use client';

import { MusicalNoteIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import React, { useEffect, useMemo, useRef } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { toast } from 'react-toastify';
import { z } from 'zod';

import { WarningWithAccentBorder } from '@/components/alert/WarningWithAccentBorder';
import { AutoComplete } from '@/components/common';
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
import { AudioManager } from '@/components/transcriber/AudioManager';
import Transcript from '@/components/transcriber/Transcript';
import { Button } from '@/components/ui/Button';
import Constants, { Code, LAYOUT_TYPES, OtherSource } from '@/core/Constants';
import hintHelpers from '@/helpers/hint';
import { useCollections } from '@/hooks/collection';
import { useSources } from '@/hooks/source';
import { useTranscriber } from '@/hooks/transcriber/useTranscriber';
import { useMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import ACL from '@/services/ACL';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawPodcast } from '@/store/types';

const podcastSchema = z.object({
  name: z.string().min(1),
  subName: z
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
  postDate: z.string().optional(),
  sourceKey: z.string(),
  collections: z.array(z.string()).optional(),
  transcript: z.any().optional(),
  level: z.string().optional(),
  audio: z.union([z.array(z.any()), z.array(z.string())]),
  image: z.union([z.array(z.any()), z.array(z.string())]).optional(),
});

type PodcastFormValues = z.infer<typeof podcastSchema>;

function Create() {
  const data = useSources();
  const me = useMe();
  const sub = MeHook.useSubscription();
  const sourceOptions = [...(data.data?.sources || []), OtherSource].map(
    (item) => ({
      value: item.id.toString(),
      label: item.name,
    })
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

  const [isPreventCreate, setIsPreventCreate] = React.useState(false);
  const [errorWords, setErrorWords] = React.useState<string[]>([]);

  const podcastListRef = useRef<RawPodcast[]>([]);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PodcastFormValues>({
    defaultValues: { privacy: '1', sourceKey: OtherSource.id.toString() },
    resolver: zodResolver(podcastSchema),
  });

  const resultValue = useWatch({ control, name: 'result' });
  // if wanting to create paragraph, user must click button to generate new hint
  // because old hint is not fit with new paragraph, so we need to check if paragraph is changed
  useEffect(() => {
    setIsPreventCreate(true);
  }, [resultValue]);

  /**
   * @desc Prepare for transcribing audio
   */
  const audioValue = useWatch({ control, name: 'audio', exact: true });
  const transcriptValue = useWatch({
    control,
    name: 'transcript',
    exact: true,
  });
  const file = audioValue?.[0] ? audioValue[0] : undefined;
  const fileUrl =
    typeof file === 'string' ? Constants.IMAGE_URL + file : undefined;
  const transcriber = useTranscriber();
  // Auto use transcript as result if it's empty
  useEffect(() => {
    if (
      !resultValue &&
      transcriber.output?.chunks.length &&
      !transcriber.isBusy
    ) {
      const result = transcriber.output.text;
      setValue('result', result);
    }
  }, [transcriber.output]);

  const onChangeHintIndexes = (indexes: number[]) => {
    const hintText = getParagraphWithHintIndexes(
      formatParagraph(resultValue),
      indexes
    );
    setValue('hint', indexes);
    setValue('hintText', hintText);

    setIsPreventCreate(false);
  };

  const handleCheckData = (): boolean => {
    const words = getErrorWords(formatParagraph(resultValue));
    if (words.length > 0) {
      setErrorWords(words);
      return false;
    }

    return true;
  };

  const onSubmit: SubmitHandler<PodcastFormValues> = async (formData) => {
    try {
      const isValid = handleCheckData();
      if (!isValid) return;

      const {
        name,
        subName,
        privacy,
        hint,
        image,
        audio,
        description,
        postDate,
        collections: collectionList,
        sourceKey,
        transcript,
      } = formData;

      // if (
      //   (transcriber.isBusy ||
      //     transcriber.isModelLoading ||
      //     !transcriber.output?.chunks.length) &&
      //   !transcript
      // ) {
      //   toast.error('Please wait for the transcription to finish');
      //   return;
      // }

      const res: AnyObject = await Fetch.postWithAccessToken<{
        podcast: RawPodcast;
        code: number;
      }>('/api/podcasts/create', {
        name,
        sub_name: subName,
        result: formatParagraph(resultValue),
        hint: JSON.stringify(hint.sort((a, b) => a - b)),
        description,
        image: image?.[0] || null,
        audio: audio[0],
        since: postDate,
        status: 1,
        privacy: Number(privacy),
        source_key: Number(sourceKey),
        transcript:
          transcriber.output?.chunks && transcriber.output.chunks.length
            ? JSON.stringify(transcriber.output?.chunks)
            : JSON.stringify(transcript),
        collection_ids: (collectionList || []).map((e) => Number(e)).join('_'),
        result_array: JSON.stringify(
          hintHelpers.splitWords(formatParagraph(resultValue))
        ),
      });

      if (res && res.data) {
        if (res.data.code !== Code.SUCCESS) {
          toast.error(res.data.message);
        } else {
          toast.success('Add Podcast Successful!');
          window.location.reload();
        }
      }
    } catch (err) {
      toast.error('Some errors occurred!');
    }
  };

  const handleCopyPodcast = (val: number) => {
    const selectedPodcast = podcastListRef?.current?.find(
      (pod) => pod.id === val
    );

    if (!selectedPodcast) {
      toast.warning('Cannot copy podcast!');

      return;
    }

    const {
      name,
      image_url: imageUrl,
      description,
      file_path: audioUrl,
      result,
      source_key: source,
      collections: collectionList,
      transcript,
    } = selectedPodcast;
    setValue('transcript', transcript);
    setValue('name', `${name} - copied by ${me?.data?.fullname}`);
    setValue('description', description);
    setValue('result', result);
    setValue('image', [imageUrl]);
    setValue('audio', [audioUrl]);
    setValue('sourceKey', String(source));
    setValue('collections', collectionList);

    setValue('privacy', '1');

    // clear previous values to let user know: "you have to generate new one to submit"
    setValue('hint', []);
    setValue('hintText', '');
  };

  const getPodcasts = async (searchString: string) => {
    const result: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
      '/api/podcasts/search',
      {
        q: searchString,
      }
    );

    if (!result?.data?.podcasts) {
      return Promise.resolve([]);
    }

    // save the last search result
    podcastListRef.current = result.data.podcasts;

    const podcastList = result.data.podcasts.map((pod: RawPodcast) => ({
      value: pod.id,
      label: (
        <div className="flex gap-2 items-center">
          <div
            className="w-6 h-6 rounded bg-cover bg-center"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL}${pod.image_url})`,
            }}
          />
          <span className="flex-1">{pod.name}</span>
        </div>
      ),
    }));

    return Promise.resolve(podcastList);
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
      <h3 className="text-base font-bold text-gray-900 mb-6">
        Create new podcast
        <a
          target="_blank"
          className="text-sm text-primary ml-2 font-medium hover:underline"
          href="https://blog.wele-learn.com/3-buoc-de-dang-bai-podcast-tren-wele/"
        >
          (Hướng dẫn chi tiết)
        </a>
      </h3>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm text-gray-900">
          Copy content from existing podcast:
        </span>

        <div className="200px">
          <AutoComplete
            onFetch={getPodcasts}
            onSelect={(value) => handleCopyPodcast(Number(value))}
            inputClassName="py-1"
            placeholder="Search podcast"
          />
        </div>
      </div>

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
                  error={errors?.subName?.message}
                >
                  <Controller
                    name="subName"
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
              <AudioManager
                transcriber={transcriber}
                autoStart={!transcriptValue}
                fileUrl={fileUrl}
                file={typeof file === 'string' ? undefined : file}
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
                <div>{`Đáp án có những từ sau bị lỗi: ${errorWords.join(', ')}.`}</div>
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
                      { value: '0', label: 'Public' },
                      { value: '1', label: 'Private' },
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
                name="postDate"
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
                name="sourceKey"
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
          <div
            className="bg-white py-3 px-6 shadow-light flex items-center"
            title={isPreventCreate ? 'Bạn cần generate hint' : ''}
          >
            <Button
              className="mr-4"
              size="small"
              onClick={handleSubmit(onSubmit)}
              loading={isSubmitting}
              disabled={isSubmitting || isPreventCreate}
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

Create.layout = LAYOUT_TYPES.Admin;

export default Create;
