import { FolderOpenIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, Modal } from '@/components/common';
import LogEvent from '@/packages/firebase/LogEvent';
import { ReportWordType } from '@/store/types';

import { WordItem } from './WordItem';

type WordListProps = {
  data: ReportWordType[];
  title?: string;
  className?: string;
};

export function WordListRate(props: WordListProps) {
  const { title, className, data } = props;

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className={twMerge('flex flex-col gap-3', className)}>
      <div className="rounded-lg bg-white p-6">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
          <span className="text-sm font-bold text-gray-900">{title}</span>
          <span className="text-sm text-gray-900">Tỉ lệ đúng</span>
        </div>

        <div className="flex flex-col gap-6">
          {data.slice(0, 3).map((word, index) => (
            <WordItem key={`${title}_${index}`} data={word} showRate />
          ))}

          {data?.length ? (
            <Button
              type="outline"
              className="w-full"
              onClick={() => {
                LogEvent.sendEvent('profile.see_all_activities');
                setOpenModal(true);
              }}
            >
              Xem chi tiết ({data?.length})
            </Button>
          ) : (
            <div className="text-sm text-gray-500 flex items-center gap-2 justify-center pt-3">
              <FolderOpenIcon className="w-5 h-5" />
              Chưa có dữ liệu
            </div>
          )}
        </div>
      </div>

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title={title ?? 'All'}
        width="700px"
        onOk={() => setOpenModal(false)}
      >
        <div className="flex items-center gap-8 text-sm text-gray-900 pt-4 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full" />
            Nghe đúng
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red-500 rounded-full" />
            Nghe sai
          </div>
        </div>

        <div className="flex flex-wrap gap-8 max-h-screen-80 overflow-y-auto custom-scrollbar mt-4">
          {data.map((word, index) => (
            <WordItem
              key={`${title}_modal_${index}`}
              data={word}
              style={{ width: '100%' }}
              showRate
              showRateRecord
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
