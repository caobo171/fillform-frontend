'use client';

import {
  ChatBubbleLeftIcon,
  CheckIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';
import { useCallback, useState } from 'react';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { Button } from '@/components/common';
import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';

const SETTINGS: {
  name: string;
  key: 'toggle_play' | 'prev' | 'next';
  default: string;
}[] = [
  { name: 'Nghe / Tạm dừng', key: 'toggle_play', default: '1' },
  { name: 'Tua lại', key: 'prev', default: '2' },
  { name: 'Tua đi', key: 'next', default: '3' },
];

export function PodcastListenSetting(props: {
  onClickReportIssue(): Promise<void>;
}) {
  const { onClickReportIssue } = props;

  const [isEditing, setEditing] = useState(false);

  const me = MeHook.useMe();

  const {
    settings,
    amount_time_adjust: amountTimeAdjust,
    onChangeAdjustTime,
    onChangeSettingKeyboard,
  } = usePlayerContext();

  const logEvent = useCallback(
    (name: string) => {
      LogEvent.sendEvent('click', {
        category: 'podcast_listen',
        name,
        user_id: me?.id,
      });
    },
    [me?.id]
  );

  const saveSettings = useCallback(() => {
    setEditing(false);
    logEvent('save_settings');
  }, [logEvent]);

  const editSettings = useCallback(() => {
    setEditing(true);
    logEvent('edit_settings');
  }, [logEvent]);

  return (
    <div className="hidden md:block w-1/3 none text-sm text-gray-900">
      <h5 className="flex items-center gap-3 mb-4">
        Phím tắt điều khiển mp3
        {isEditing ? (
          <div
            aria-hidden="true"
            title="Lưu thay đổi"
            className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-md hover:bg-emerald-100"
            onClick={saveSettings}
          >
            <CheckIcon className="w-5 h-5 text-emerald-500" />
          </div>
        ) : (
          <div
            aria-hidden="true"
            title="Chỉnh sửa"
            className="w-8 h-8 flex items-center justify-center cursor-pointer rounded-md hover:bg-gray-100"
            onClick={editSettings}
          >
            <PencilSquareIcon className="w-5 h-5 text-gray-500" />
          </div>
        )}
      </h5>

      <div className="flex flex-col gap-4">
        {SETTINGS.map((setting, index) => (
          <div key={index} className="flex gap-3 items-center">
            {isEditing ? (
              <input
                name={setting.key}
                type="text"
                maxLength={1}
                className="outline-none ring-1 ring-gray-500 py-1.5 px-2 rounded-md w-8 text-center"
                value={settings[setting.key]}
                onChange={onChangeSettingKeyboard}
              />
            ) : (
              <span className="w-8 h-8 flex items-center justify-center ring-1 ring-gray-300 bg-gray-100 rounded-md">
                {settings[setting.key]}
              </span>
            )}

            {setting.name}
          </div>
        ))}

        <div className="flex items-center gap-2">
          Thời gian tua
          {isEditing ? (
            <input
              className="outline-none ring-1 ring-gray-500 py-1.5 px-2 rounded-md w-12 text-center"
              type="number"
              onChange={onChangeAdjustTime}
              name=""
              value={amountTimeAdjust}
            />
          ) : (
            <span className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-md">
              {amountTimeAdjust}
            </span>
          )}
          giây
        </div>
      </div>

      <p className="text-gray-600 mt-5 mb-5">
        Lưu ý: ấn Ctrl+1 để gõ phím 1, Ctrl+2 để gõ phím 2 trong bài chép.
      </p>

      <div className="pt-6 border-t border-gray-200">
        <Button type="secondary" rounded onClick={async () => {
          logEvent('report_issue');
          await onClickReportIssue();
          window.open('https://www.facebook.com/welevn/', '_blank');
        }}>
          <ChatBubbleLeftIcon className="w-5 h-5" />
          Báo cáo lỗi sai
        </Button>

        <p className="mt-4 text-gray-600">
          Báo cáo lỗi sai cho đội ngũ admins của WELE qua Facebook page, trong
          trường hợp gặp phải bất kì vấn đề gì trong quá trình nghe bạn nhé.
        </p>
      </div>
    </div>
  );
}
