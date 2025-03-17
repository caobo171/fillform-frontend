import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { MoreHorizontalIcon } from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { ClassApi } from '@/app/admin/classes/classApi';
import { useFeedbacks } from '@/app/admin/classes/classHook';
import { Button, Dropdown, Modal, TextArea } from '@/components/common';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

dayjs.extend(relativeTime);

type FeedbackProps = {
  classId: string;
  studentId: string;
};

export function Feedback(props: FeedbackProps) {
  const { classId, studentId } = props;

  const { data, mutate } = useFeedbacks(classId, studentId);

  const { trigger: add, isMutating: isAdding } = useSWRMutation(
    ClassApi.AddFeedback,
    Fetch.postFetcher.bind(Fetch)
  );

  const { trigger: edit, isMutating: isEditing } = useSWRMutation(
    ClassApi.EditFeedback,
    Fetch.postFetcher.bind(Fetch)
  );

  const contentRef = useRef<HTMLTextAreaElement>(null);

  const editContentRef = useRef<HTMLTextAreaElement>(null);

  const [editId, setEditId] = useState<number>(-1);

  const [open, setOpen] = useState<boolean>(false);

  const sendFeedback = useCallback(async () => {
    if (!contentRef?.current?.value) {
      return;
    }

    const content = contentRef.current.value;

    const res: AnyObject = await add({
      payload: { content, class_id: classId, receiver_id: studentId },
    });

    if (res?.data?.code !== Code.Error) {
      mutate();

      contentRef.current.value = '';
    } else {
      toast.error(res?.data?.message);
    }
  }, [classId, studentId, add, mutate]);

  const updateFeedback = useCallback(async () => {
    const res: AnyObject = await edit({
      payload: { id: editId, content: editContentRef?.current?.value },
    });

    if (res?.data?.code !== Code.Error) {
      mutate();

      setEditId(-1);
    } else {
      toast.error(res?.data?.message);
    }
  }, [edit, editId, mutate]);

  const handleDropdownItemClick = (val: string, id: number) => {
    if (val === 'edit') {
      setEditId(id);
    }
  };

  const closeModal = useCallback(() => {
    setEditId(-1);

    setOpen(false);
  }, []);

  return (
    <>
      <Button type="outline" onClick={() => setOpen(true)}>
        <ChatBubbleOvalLeftIcon className="w-5 h-5" /> Give feedback (
        {data?.length})
      </Button>

      <Modal
        open={open}
        onCancel={closeModal}
        title="Give feedback"
        okButtonProps={{ className: 'hidden' }}
        width="600px"
      >
        <div className="py-6">
          <TextArea
            placeholder="Tell them what they’ve done well and what they need to improve..."
            className="mb-4"
            ref={contentRef}
          />

          <Button
            loading={isAdding}
            onClick={sendFeedback}
            className="mb-[48px]"
          >
            Send
          </Button>

          <div className="divide-y divide-gray-100">
            {data.map((item) => (
              <div key={item.id} className="py-4 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-900 font-medium">
                    {item.reviewer_name}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {dayjs(item.create_at * 1000).fromNow()}
                    </span>

                    <Dropdown
                      options={[
                        { label: 'Edit', value: 'edit' },
                        { label: 'Delete', value: 'delete' },
                      ]}
                      className="h-[20px]"
                      onClickItem={(val: string) =>
                        handleDropdownItemClick(val, item.id)
                      }
                    >
                      <MoreHorizontalIcon className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700" />
                    </Dropdown>
                  </div>
                </div>

                {editId === item.id ? (
                  <div className="flex flex-col gap-3">
                    <TextArea ref={editContentRef}>{item.content}</TextArea>

                    <div className="flex gap-2">
                      <Button
                        size="small"
                        loading={isEditing}
                        onClick={updateFeedback}
                      >
                        Save
                      </Button>

                      <Button
                        type="secondary"
                        size="small"
                        onClick={() => setEditId(-1)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-700">{item.content}</p>
                )}
              </div>
            ))}

            <div />
          </div>
        </div>
      </Modal>
    </>
  );
}
