import { ChatBubbleOvalLeftEllipsisIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useState } from 'react';

import { useFeedbacks } from '@/app/admin/classes/classHook';
import { Button, Modal } from '@/components/common';
import { Helper } from '@/services/Helper';
import { MeHook } from '@/store/me/hooks';

dayjs.extend(relativeTime);

type FeedbackProps = {
  classId: string;
};

export function Feedback(props: FeedbackProps) {
  const { classId } = props;

  const me = MeHook.useMe();

  const { data } = useFeedbacks(classId, String(me?.id));

  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        rounded
        onClick={() => setOpen(true)}
        className="group flex-shrink-0 flex items-center gap-1 cursor-pointer"
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-5 h-5" />
        Nhận xét từ giáo viên ({data.length})
      </Button>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        title="Nhận xét của giáo viên"
        okButtonProps={{ className: 'hidden' }}
        width="600px"
        cancelText="Ok"
      >
        <div className="py-6">
          {data?.length ? (
            <div className="divide-y divide-gray-100">
              {data.map((item) => (
                <div key={item.id} className="py-4 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-900 font-medium">
                      {item.reviewer_name}
                    </span>

                    <span className="text-xs text-gray-500">
                      {Helper.convertFromNowToVNText(
                        dayjs(item.create_at * 1000).fromNow()
                      )}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              ))}

              <div />
            </div>
          ) : (
            <p className="text-sm text-gray-700">
              Bạn chưa có nhận xét nào từ giáo viên
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
