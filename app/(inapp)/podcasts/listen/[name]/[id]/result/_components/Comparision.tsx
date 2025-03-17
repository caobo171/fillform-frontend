'use client';

import {
  CircleStackIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import $ from 'jquery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { Button } from '@/components/common';
import { Code, FILLER_TEXT } from '@/core/Constants';
import HintHelpers from '@/helpers/hint';
import { useMe, useReloadMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { Toast } from '@/services/Toast';
import { TranscriptAnalyze } from '@/services/TranscriptAnalyze';
import { MeHook } from '@/store/me/hooks';
import { WordReview } from '@/store/types';

const confirm = async (content: string, title: string) =>
  (await import('react-st-modal')).Confirm(content, title);

const {
  shouldAddNoSpaceNext,
  shouldAddNoSpacePrevious,
  shouldAddNoSpaceWithAcronym,
  specialPunctuations,
} = HintHelpers;

type Transcript = {
  text: string;
  timestamp: [number, number | null];
};

export function ResultComparision() {
  const { podcast_submit, podcast, changeCurrentTime, audio, time_listen } =
    usePlayerContext();

  const ref = React.useRef<HTMLParagraphElement>(null);

  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [onLoadingListenResult, setOnLoadingListenResult] = useState(false);

  const transcriptChunks = useMemo(() => {
    const chunks = new TranscriptAnalyze(podcast.transcript || []).getChunks(
      Object.values(podcast_submit.result_array)
    );
    return chunks;
  }, [podcast.transcript, podcast.result_array, podcast_submit.result_array]);

  const handleSync = useCallback(
    (timeListen: number) => {
      const currentIndex = transcriptChunks
        ?.filter((e) => e)
        .findIndex(
          (item) =>
            !!(
              item.timestamp[0] <= timeListen + 1 &&
              item.timestamp[1] &&
              item.timestamp[1] >= timeListen + 1
            )
        );

      if (typeof currentIndex === 'number' && currentIndex >= 0) {
        setHighlightIndex(currentIndex);
      }
    },
    [podcast.transcript]
  );

  useEffect(() => {
    handleSync(time_listen);
  }, [handleSync, time_listen]);

  const sub = MeHook.useSubscription();
  const isPremiumUser = useMemo(() => Helper.isPremiumUser(sub), [sub]);
  const { reloadMe } = useReloadMe();
  const { data: me } = useMe();

  const isAllowListenResult = useMemo(
    () =>
      me?.data?.podcasts?.find((p) => p.podcast_id === podcast.id)
        ?.is_allow_listen_result || false,
    [me, podcast.id]
  );

  useEffect(() => {
    if (!ref.current) return;

    $(ref.current).on('contextmenu', async (e: any) => {
      e.preventDefault();
      if (e.which == 3) {
        if ($(e.target).data('index') !== undefined) {
          const word = podcast_submit.result_array[$(e.target).data('index')];

          const result = await confirm(
            `Thêm từ **${word}** ở vị trí đã chọn để ôn tập`,
            'Thêm từ để ôn tập'
          );

          if (!result) {
            return;
          }

          if (!isPremiumUser) {
            return Toast.error('Chức năng này chỉ dành cho người dùng Premium');
          }

          const res = await Fetch.postWithAccessToken<{
            code: number;
            following: WordReview;
          }>('/api/word.review/create', {
            word_index: $(e.target).data('index'),
            submit_id: podcast_submit.id,
            word: word.toLocaleLowerCase().trim(),
          });

          if (res.data?.code === 1) {
            Toast.success('Thêm từ vào ôn tập thành công');
          } else {
            Toast.error('Thêm từ vào ôn tập thất bại');
          }
        }

        return false;
      }
    });

    return () => {
      if (!ref.current) return;
      $(ref.current).off('mousedown');
    };
  }, [ref]);

  /**
   * @desc Display result by start and end index
   */
  const renderResultRange = useCallback(
    (start: number, end: number) => {
      if (podcast_submit.version < 2) {
        return [];
      }
      const result_string = [];
      for (let i = start; i < end; i++) {
        const remove_enter_value = podcast_submit.result_array[i].replace(
          '\n',
          ''
        );
        const converted_value = remove_enter_value;

        if (podcast_submit.result_array[i].includes('\n')) {
          result_string.push(<br />);
          continue;
        }

        if (
          shouldAddNoSpaceNext(
            podcast_submit.result_array[i],
            podcast_submit.result_array[i + 1]
          ) ||
          (!!podcast_submit.result_array[i - 1] &&
            shouldAddNoSpacePrevious(
              podcast_submit.result_array[i - 1],
              podcast_submit.result_array[i]
            )) ||
          shouldAddNoSpaceWithAcronym(
            podcast_submit.result_array[i],
            podcast_submit.result_array[i + 2]
          )
        ) {
          result_string.push(converted_value);
        } else {
          result_string.push(`${converted_value} `);
        }
      }

      return result_string;
    },
    [podcast_submit.result_array, podcast_submit.podcast_hints]
  );

  /**
   * @desc Display diff between user answer and correct answer
   */
  const renderDiffs = useCallback(
    (diffs: any[], start: number, end: number) => {
      const isAddNoSpaceCondition = (i: number) =>
        shouldAddNoSpaceNext(
          podcast_submit.result_array[i],
          podcast_submit.result_array[i + 1]
        ) ||
        (!!podcast_submit.result_array[i - 1] &&
          shouldAddNoSpacePrevious(
            podcast_submit.result_array[i - 1],
            podcast_submit.result_array[i]
          )) ||
        shouldAddNoSpaceWithAcronym(
          podcast_submit.result_array[i],
          podcast_submit.result_array[i + 2]
        );

      const hints = podcast_submit.podcast_hints;
      const result = [];
      for (let index = start; index < end; index++) {
        const e = diffs[index];
        if (e.length === 1) {
          let data = e[0][1];

          if (hints.includes(index) && !specialPunctuations.includes(data)) {
            result.push(
              <React.Fragment key={index}>
                <span
                  key={index}
                  className="bg-green-200 hover:text-gray-800"
                  data-index={index}
                >
                  {data}
                </span>
                {!isAddNoSpaceCondition(index) && ' '}
                {data === '\n' && <br />}
              </React.Fragment>
            );
          } else {
            result.push(
              <React.Fragment key={index}>
                <span
                  key={index}
                  className="hover:text-gray-800"
                  data-index={index}
                >
                  {data}
                </span>
                {!isAddNoSpaceCondition(index) && ' '}
                {data === '\n' && <br />}
              </React.Fragment>
            );
          }
        }
        if (e.length === 2) {
          // const wrong_data = e[0][1];
          const wrong_data = e[0][1] === FILLER_TEXT ? '' : e[0][1];
          const correct_data = e[1][1];

          result.push(
            <React.Fragment key={index}>
              {wrong_data.length > 0 && (
                <>
                  <del
                    className="bg-red-200 cursor-pointer hover:text-gray-800"
                    data-index={index}
                    onClick={() => handlePlayAtWord(index)}
                  >
                    {wrong_data}
                  </del>
                  &nbsp;
                </>
              )}
              {correct_data.length > 0 && (
                <span
                  className="bg-yellow-200 hover:text-gray-800"
                  data-index={index}
                >
                  {correct_data}
                </span>
              )}
              {!isAddNoSpaceCondition(index) && <>&nbsp;</>}
            </React.Fragment>
          );
        }
      }

      return result;
    },
    [podcast_submit.result_array, podcast_submit.podcast_hints]
  );

  const resultParagraph = useMemo(() => {
    if (podcast_submit.version < 2) {
      return [];
    }

    return renderResultRange(
      0,
      Object.keys(podcast_submit.result_array).length
    );
  }, [podcast_submit.result_array]);

  const resultContent = useMemo(() => {
    if (podcast_submit.version < 2) {
      return podcast_submit.podcast_result;
    }

    if (!podcast?.transcript?.length) {
      return resultParagraph;
    }
    return (
      <>
        {transcriptChunks
          .filter((e) => e)
          .map((item, index: number) =>
            isAllowListenResult ? (
              <p
                key={`${item.value?.start}-${item.value?.end}`}
                className={twMerge(
                  'cursor-pointer transition hover:text-orange-500 inline',
                  highlightIndex === index
                    ? 'text-green-500 hover:text-green-500'
                    : ''
                )}
                aria-hidden="true"
                onClick={() => changeCurrentTime(item.timestamp[0])}
              >
                {renderResultRange(item.value?.start, item.value?.end)}
              </p>
            ) : (
              <p
                key={`${item.value?.start}-${item.value?.end}`}
                aria-hidden="true"
                className={twMerge('inline')}
              >
                {renderResultRange(item.value?.start, item.value?.end)}
              </p>
            )
          )}
      </>
    );
  }, [
    podcast_submit,
    podcast,
    resultParagraph,
    highlightIndex,
    changeCurrentTime,
    isAllowListenResult,
  ]);

  const handlePlayAtWord = useCallback(
    (wordIndex: number) => {
      const text = new TranscriptAnalyze(
        podcast.transcript || []
      ).getResultChunkWithWordIndex(podcast_submit, wordIndex);

      if (text && audio && audio?.duration && text?.timestamp?.[0]) {
        setTimeout(() => {
          changeCurrentTime(text.timestamp?.[0] - 3, true);
        }, 0);
      }
    },
    [audio, changeCurrentTime, podcast.transcript, podcast_submit]
  );

  const getDiff = () => {
    const { diffs } = podcast_submit.compare_result;
    if (podcast_submit.version >= 2) {
      // If result array is the same and has transcript => return in transcript format
      if (
        Object.keys(podcast_submit.result_array).length ===
          Object.keys(podcast.result_array).length &&
        podcast.transcript?.length
      ) {
        return transcriptChunks
          .filter((e) => e)
          .map((item, index: number) =>
            isAllowListenResult ? (
              <p
                key={`${item.text}`}
                className={twMerge(
                  'cursor-pointer transition hover:text-orange-500 inline',
                  highlightIndex === index
                    ? 'text-green-500 hover:text-green-500'
                    : ''
                )}
                aria-hidden="true"
                onClick={() => changeCurrentTime(item.timestamp[0])}
              >
                {renderDiffs(diffs, item.value.start, item.value.end)}
              </p>
            ) : (
              <p
                key={`${item.text}`}
                className={twMerge('inline')}
                aria-hidden="true"
              >
                {renderDiffs(diffs, item.value.start, item.value.end)}
              </p>
            )
          );
      }

      return renderDiffs(diffs, 0, diffs.length);
    }

    /**
     * @desc Legacy for version 1
     */
    return diffs.map((e: any, index: number) => {
      const type = e[0];
      const data = e[1];

      if (type == -1) {
        return (
          <React.Fragment key={index}>
            <del className="bg-red-200">{data}</del>
          </React.Fragment>
        );
      }

      if (type == 1) {
        return (
          <span key={index} className="bg-green-200">
            {data}
          </span>
        );
      }

      return <React.Fragment key={index}>{data}</React.Fragment>;
    });
  };

  const onListenResult = useCallback(async () => {
    const isConfirm = await confirm(
      'Bạn có chắc chắn muốn dùng chức năng đọc theo đáp án không?',
      'Xác nhận'
    );

    if (!isConfirm) {
      return;
    }

    try {
      setOnLoadingListenResult(true);
      const res = await Fetch.postWithAccessToken<{
        code: number;
        message: string;
      }>('/api/me/listen.result', {
        podcast_id: podcast.id,
      });

      if (res.status === 200) {
        if (res.data && res.data.code === Code.SUCCESS) {
          toast.success('Chức năng đọc theo đáp án đã được kích hoạt');
          reloadMe();
        } else {
          toast.error(res.data.message);
          return;
        }
      }
    } catch {
      toast.error('Some errors occurred');
    } finally {
      setOnLoadingListenResult(false);
    }
  }, []);

  return (
    <div className="w-full flex flex-col gap-8 semi-md:flex-row">
      <div className="w-full semi-md:w-1/2 flex flex-col p-6 gap-6 rounded-lg text-gray-900 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
            <DocumentCheckIcon className="w-5 h-5 text-white" />
          </div>

          <h3 className="font-semibold text-xl">Đáp án</h3>

          {!isAllowListenResult && (
            <Button
              type="secondary"
              onClick={onListenResult}
              rounded
              loading={onLoadingListenResult}
            >
              <SpeakerWaveIcon className="w-5 h-5 text-gray-700" />

              <span>Đọc theo đáp án</span>

              <span className="flex items-center text-gray-500">
                (<span className="text-red-500 mr-1">-2</span>
                <CircleStackIcon className="w-4 h-4 text-orange-500" />)
              </span>
            </Button>
          )}
        </div>

        <p id="comparison-your-answer" className="text-base text-gray-700">
          {resultContent}
        </p>
      </div>

      <div className="w-full semi-md:w-1/2 flex flex-col p-6 gap-6 rounded-lg text-gray-900 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
            <DocumentTextIcon className="w-5 h-5 text-white" />
          </div>

          <h3 className="font-semibold text-xl">Bài nghe của bạn</h3>
        </div>

        <p className="text-base text-gray-700" ref={ref}>
          {getDiff()}
        </p>
      </div>
    </div>
  );
}
