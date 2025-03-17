'use client';

import {
  ArrowDownTrayIcon,
  BookmarkSquareIcon,
  CircleStackIcon,
  ClipboardDocumentCheckIcon,
  CloudArrowUpIcon,
  LightBulbIcon,
  ViewfinderCircleIcon,
} from '@heroicons/react/24/outline';
import ExcelJS from 'exceljs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { OutOfCoinWarning } from '@/app/(inapp)/_components/OutOfCoinWarning';
import { SubmitModal } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/SubmitModal';
import { Button } from '@/components/common';
import {
  Code,
  HIGH_LIGHT_HINT_TYPE,
  PostCastSubmitType,
} from '@/core/Constants';
import { legacySplitWords } from '@/helpers/hint';
import { useReloadMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import LogEvent from '@/packages/firebase/LogEvent';
import { Toast } from '@/services/Toast';
import { AnyObject } from '@/store/interface';
import {
  RawPodcast,
  RawPodcastSubmit,
  RawUser,
  RawUserActionLog,
} from '@/store/types';

const confirm = async (content: string, title: string) =>
  (await import('react-st-modal')).Confirm(content, title);

type PodcastActionsProps = {
  floating?: boolean;
  onSaveProgress(): Promise<void>;
  onLoadingSaveProgress?: boolean;
  podcast: RawPodcast;
  podcastSubmit: RawPodcastSubmit;
  timeListen: number;
  actionLog: RawUserActionLog | null | undefined;
  contentArray: string[];
  content: string;
  setLockUpdate(value: boolean): void;
  me: RawUser | null;
};

export function PodcastActions({
  floating,
  onSaveProgress,
  onLoadingSaveProgress,
  podcast,
  podcastSubmit,
  timeListen,
  actionLog,
  contentArray,
  content,
  setLockUpdate,
  me,
}: PodcastActionsProps) {
  const { reloadMe } = useReloadMe();

  const totalCoin = useMemo(
    () => (me?.allowance_coin ?? 0) + (me?.earning_coin ?? 0),
    [me]
  );

  const [onLoadingChangeHint, setOnLoadingChangeHint] = useState(false);
  const [onLoadingShowWrongHint, setOnLoadingShowWrongHint] = useState(false);
  const [onLoadingGetWordsResult, setOnLoadingGetWordsResult] = useState(false);

  const [showOutOfCoinWarning, setShowOutOfCoinWarning] = useState(false);
  const [showSubmittingModal, setShowSubmittingModal] = useState(false);

  const onChangeHint = useCallback(async () => {
    const result = await confirm(
      `Chuyển sang gợi ý và bạn sẽ mất tất cả bài chép hiện tại`,
      'Chuyển sang gợi ý!'
    );
    if (!result) {
      return;
    }

    try {
      setLockUpdate(true);
      if (podcast) {
        LogEvent.sendEvent('listen.change_to_hint');
        const res = await Fetch.postWithAccessToken<{
          podcastSubmit: RawPodcastSubmit;
          code: number;
        }>('/api/podcast.submit/get', {
          id: podcast.id,
          metatype: 'hint',
        });

        if (res.status === 200) {
          if (res.data && res.data.code === Code.SUCCESS) {
            toast.success('Bắt đầu nghe!');
            window.location.reload();
          }
        }
      }
    } catch {
      toast.error('Some errors occurred!');
    } finally {
      setLockUpdate(false);
    }
  }, [podcast, setLockUpdate]);

  const getSubmitData = (
    (extra: AnyObject = {}) => {
      let userText;
      if (podcastSubmit.version < 2) {
        userText =
          podcastSubmit.metatype === 'hint'
            ? Podcast.getResultContent(podcastSubmit, contentArray)
            : content;
      } else {
        userText = contentArray.join(' ');
      }
      return {
        ...extra,
        id: podcastSubmit.id,
        content: userText,
        result_text:
          podcastSubmit.version < 2
            ? legacySplitWords(podcastSubmit.podcast_result).join(' ')
            : Object.values(podcastSubmit.result_array).join(' '),
        user_text: userText,
        content_array: JSON.stringify(contentArray),
        hint_count: podcastSubmit.metatype === 'hint' ? podcast.hint.length : 0,
      };
    }
  );

  const onSubmit = async () => {
    if (actionLog) {
      LogEvent.sendEvent('listen.submit');

      return Fetch.postWithAccessToken<{
        code: number;
        message: string;
        podcastSubmit: RawPodcastSubmit;
      }>(
        podcastSubmit.can_resubmit
          ? '/api/podcast.submit/resubmit'
          : '/api/podcast.submit/submit',
        getSubmitData({ action_log_id: actionLog.id })
      );
    }

    return Promise.reject();
  };

  /**
   * @desc Highlight the hint word with wrong or correct color
   * @param index
   * @param type
   * @returns
   */
  const highlightHint = useCallback(
    ({ index, type }: { index: number; type: string }) => {
      const hintWordInput = document.querySelector(
        `.hint-word input[data-index="${index}"]`
      );

      if (hintWordInput) {
        if (type === HIGH_LIGHT_HINT_TYPE.WRONG) {
          hintWordInput.classList.add('wrong-hint-word');
        } else if (type === HIGH_LIGHT_HINT_TYPE.CORRECT) {
          hintWordInput.classList.remove('wrong-hint-word');
        }
      }
    },
    []
  );

  const onTestResult = useCallback(async () => {
    LogEvent.sendEvent('listen.test_result');

    try {
      const result: AnyObject = await Fetch.postWithAccessToken(
        '/api/podcast.submit/compare',
        getSubmitData()
      );

      await confirm(
        `Kết quả của bạn bây giờ là ${(Number(result.data.percent) * 100).toFixed(2)}%`,
        'Bắt đầu nghe!'
      );
    } catch (err) {
      toast.error('Some errors occurred when comparing');
    }
  }, [getSubmitData]);

  const onShowWrongHint = useCallback(async () => {
    if (podcastSubmit.version < 2) {
      Toast.error('Chỉ có thể hiện ô sai với bài nghe có phiên bản mới nhất');
      return;
    }

    if (totalCoin < 2) {
      setShowOutOfCoinWarning(true);
      return;
    }

    const isConfirm = await confirm(
      'Hiện ô sai sẽ mất 2 coin, bạn có chắc chắn muốn hiện ô sai không?',
      'Hiện ô sai!'
    );

    if (!isConfirm) {
      return;
    }

    try {
      setOnLoadingShowWrongHint(true);

      LogEvent.sendEvent('listen.show_wrong_hint');

      const result: AnyObject = await Fetch.postWithAccessToken(
        '/api/podcast.submit/get_wrong_hints',
        getSubmitData()
      );

      const { wrong_hint_indexes: wrongHintIndexes } = result.data;

      if (!wrongHintIndexes) {
        Toast.error(result?.data?.message || 'Some errors occurred!');
        return;
      }

      const hintIndexes = podcastSubmit.podcast_hints;
      for (let i = 0; i < hintIndexes.length; i++) {
        if (wrongHintIndexes.includes(hintIndexes[i])) {
          highlightHint({
            index: hintIndexes[i],
            type: HIGH_LIGHT_HINT_TYPE.WRONG,
          });
        } else {
          highlightHint({
            index: hintIndexes[i],
            type: HIGH_LIGHT_HINT_TYPE.CORRECT,
          });
        }
      }
    } catch (err) {
      Toast.error('Some errors occurred!');
    } finally {
      setOnLoadingShowWrongHint(false);
    }

    reloadMe();
  }, [
    getSubmitData,
    highlightHint,
    podcastSubmit.podcast_hints,
    podcastSubmit.version,
    reloadMe,
    totalCoin,
    me,
  ]);

  const onGetWordsResult = useCallback(async () => {
    if (podcastSubmit.version < 2) {
      Toast.error('Chỉ có thể lấy đáp án với bài nghe có phiên bản mới nhất');
      return;
    }

    if (totalCoin < 5) {
      setShowOutOfCoinWarning(true);
      return;
    }

    if (podcastSubmit.metatype !== 'hint') {
      Toast.error('Chỉ có thể lấy đáp án với bài nghe có gợi ý');
      return;
    }

    const isConfirm = await confirm(
      'Tải file kết quả lần đầu sẽ mất 5 coins, bạn có chắc chắn muốn tải file kết quả nghe về máy không?',
      'Tải file kết quả nghe!'
    );
    if (!isConfirm) {
      return;
    }

    try {
      setOnLoadingGetWordsResult(true);

      LogEvent.sendEvent('listen.get_words_result');

      const res: AnyObject = await Fetch.postWithAccessToken(
        '/api/podcast.submit/get.words.result',
        {
          id: podcastSubmit.id,
        }
      );

      const {
        words,
      }: {
        words: { word: string; level: string }[];
      } = res.data;

      if (!words) {
        Toast.error(res?.data?.message || 'Some errors occurred');
        return;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Result');
      worksheet.columns = [
        { header: 'Words', key: 'words', width: 40 },
        { header: 'Level', key: 'level', width: 20 },
      ];

      words.forEach((item) => {
        worksheet.addRow({ words: item.word, level: item.level });
      });

      workbook.xlsx.writeBuffer().then((buffer: AnyObject) => {
        // @ts-ignore
        const blob = new Blob([buffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${podcastSubmit.podcast_name}_result.xlsx`;
        a.click();
      });
    } catch (err) {
      Toast.error('Some errors occurred');
    } finally {
      setOnLoadingGetWordsResult(false);
    }

    reloadMe();
  }, [
    podcastSubmit.id,
    podcastSubmit.metatype,
    podcastSubmit.version,
    reloadMe,
    totalCoin,
    me,
  ]);

  useEffect(() => {
    const handle = async (message: any) => {
      let obj;

      try {
        obj = JSON.parse(message.data || '{}');
      } catch (err) {
        obj = message.data;
      }

      if (obj?.action == 'submit') {
        setShowSubmittingModal(true)

        return;
      }

      if (obj?.action == 'save.progress') {
        await onSaveProgress();
        // @ts-ignore
        window.ReactNativeWebView?.postMessage(
          JSON.stringify({ type: 'reload' })
        );
        return;
      }

      if (obj?.action == 'test.result') {
        await onTestResult();
      }

      if (obj?.action == 'show.wrong.hint') {
        await onShowWrongHint();
      }
    };

    document.addEventListener('message', handle);
    window.addEventListener('message', handle);

    return () => {
      document.removeEventListener('message', handle);
      window.removeEventListener('message', handle);
    };
  }, [
    podcast,
    podcastSubmit,
    actionLog,
    contentArray,
    content,
    timeListen,
    onSubmit,
    onSaveProgress,
    onTestResult,
    me,
  ]);

  if (floating) {
    return (
      <div className="fixed z-50 right-5 bottom-[100px] flex flex-col gap-4 justify-start items-end">
        <OutOfCoinWarning
          open={showOutOfCoinWarning}
          onCancel={() => setShowOutOfCoinWarning(false)}
        />

        <SubmitModal
          open={showSubmittingModal}
          onCancel={() => setShowSubmittingModal(false)}
          onSubmit={onSubmit}
          podcast={podcast}
        />

        {podcastSubmit.status !== PostCastSubmitType.SUBMITTED && (
          <Button
            size="large"
            onClick={() => setShowSubmittingModal(true)}
            rounded
            className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4"
          >
            <CloudArrowUpIcon className="w-5 h-5 text-white" />
            <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[60px] group-hover:pl-2">
              Nộp bài
            </span>
          </Button>
        )}

        {podcastSubmit.status !== PostCastSubmitType.SUBMITTED && (
          <>
            <Button
              size="large"
              type="secondary"
              onClick={onTestResult}
              rounded
              className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4 ring-0"
            >
              <ClipboardDocumentCheckIcon className="w-5 h-5 text-gray-700" />
              <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[89px] group-hover:pl-2">
                Thử kết quả
              </span>
            </Button>

            <Button
              size="large"
              type="secondary"
              onClick={onShowWrongHint}
              rounded
              loading={onLoadingShowWrongHint}
              className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4 ring-0"
            >
              <ViewfinderCircleIcon className="w-5 h-5 text-gray-700" />
              <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[73px] group-hover:pl-2">
                Hiện ô sai
              </span>
            </Button>

            <Button
              size="large"
              type="secondary"
              loading={onLoadingSaveProgress}
              onClick={onSaveProgress}
              rounded
              className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4 ring-0"
            >
              <BookmarkSquareIcon className="w-5 h-5 text-gray-700" />
              <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[63px] group-hover:pl-2">
                Lưu tạm
              </span>
            </Button>

            <Button
              size="large"
              type="secondary"
              loading={onLoadingGetWordsResult}
              onClick={onGetWordsResult}
              rounded
              className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4 ring-0"
            >
              <ArrowDownTrayIcon className="w-5 h-5 text-gray-700" />
              <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[116px] group-hover:pl-2">
                Xem từ cần điền
              </span>
            </Button>
          </>
        )}

        {podcastSubmit.status !== PostCastSubmitType.SUBMITTED &&
          podcastSubmit.metatype !== 'hint' && (
            <Button
              size="large"
              type="secondary"
              loading={onLoadingChangeHint}
              onClick={onChangeHint}
              rounded
              className="group gap-0 px-2.5 shadow-lg ease-in-out duration-300 hover:px-4 ring-0"
            >
              <LightBulbIcon className="w-5 h-5 text-gray-700" />
              <span className="ease-in-out duration-300 overflow-hidden whitespace-nowrap w-0 group-hover:w-[100px] group-hover:pl-2">
                Sử dụng gợi ý
              </span>
            </Button>
          )}
      </div>
    );
  }

  return (
    <div className="flex gap-4 items-center flex-wrap">
      <OutOfCoinWarning
        open={showOutOfCoinWarning}
        onCancel={() => setShowOutOfCoinWarning(false)}
      />

      <SubmitModal
        open={showSubmittingModal}
        onCancel={() => setShowSubmittingModal(false)}
        onSubmit={onSubmit}
        podcast={podcast}
      />

      {podcastSubmit.status !== PostCastSubmitType.SUBMITTED && (
        <Button onClick={() => setShowSubmittingModal(true)} rounded>
          <CloudArrowUpIcon className="w-5 h-5 text-white" />
          Nộp bài
          <span className="flex items-center text-white">
            (<span className="mr-1">+2</span>
            <CircleStackIcon className="w-4 h-4" />)
          </span>
        </Button>
      )}

      {podcastSubmit.status !== PostCastSubmitType.SUBMITTED && (
        <>
          <Button type="secondary" onClick={onTestResult} rounded>
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-gray-700" />
            Thử kết quả
          </Button>

          <Button
            type="secondary"
            onClick={onShowWrongHint}
            rounded
            loading={onLoadingShowWrongHint}
          >
            <ViewfinderCircleIcon className="w-5 h-5 text-gray-700" />

            <span>Hiện ô sai</span>

            <span className="flex items-center text-gray-500">
              (<span className="text-red-500 mr-1">-2</span>
              <CircleStackIcon className="w-4 h-4 text-orange-500" />)
            </span>
          </Button>

          <Button
            type="secondary"
            loading={onLoadingSaveProgress}
            onClick={onSaveProgress}
            rounded
          >
            <BookmarkSquareIcon className="w-5 h-5 text-gray-700" />
            Lưu tạm
          </Button>
        </>
      )}

      {podcastSubmit.status !== PostCastSubmitType.SUBMITTED &&
        podcastSubmit.metatype === 'hint' && (
          <Button
            type="secondary"
            loading={onLoadingGetWordsResult}
            onClick={onGetWordsResult}
            rounded
          >
            <ArrowDownTrayIcon className="w-5 h-5 text-gray-700" />

            <span>Xem từ cần điền</span>

            <span className="flex items-center text-gray-500">
              (<span className="text-red-500 mr-1">-5</span>
              <CircleStackIcon className="w-4 h-4 text-orange-500" />)
            </span>
          </Button>
        )}

      {podcastSubmit.status !== PostCastSubmitType.SUBMITTED &&
        podcastSubmit.metatype !== 'hint' && (
          <Button
            type="secondary"
            loading={onLoadingChangeHint}
            onClick={onChangeHint}
            rounded
          >
            <LightBulbIcon className="w-5 h-5 text-gray-700" />
            Sử dụng gợi ý
          </Button>
        )}
    </div>
  );
}
