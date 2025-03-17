import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';
import { twMerge } from 'tailwind-merge';

import { Input, ModalProps, Modal } from '@/components/common';
import { MeHook } from '@/store/me/hooks';

export function UserInvite({ onCancel, ...rest }: ModalProps) {
  const me = MeHook.useMe();

  const link = useMemo(
    () =>
      `${window.location.origin}/authentication/register?ref=${me?.username || ''}`,
    [me]
  );

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(link);

    toast.success('Copied');
  }, [link]);

  return (
    <Modal
      {...rest}
      width="560px"
      okText="Đóng"
      onCancel={onCancel}
      onOk={onCancel}
      title={`Mời bạn bè tham gia WELE với link`}
      cancelButtonProps={{ className: 'hidden' }}
    >
      <div className="relative flex-1">
        <Input size="small" value={link} readOnly className="pr-10" />

        <div
          aria-hidden="true"
          title="Copy"
          onClick={handleCopyLink}
          className={twMerge(
            'absolute z-1 right-0 top-0 h-[32px] w-[40px] flex items-center justify-center',
            'bg-gray-500 border-[1px] border-gray-500 rounded-r-md hover:bg-gray-700 cursor-pointer'
          )}
        >
          <DocumentDuplicateIcon className="w-5 h-5 text-white" />
        </div>
      </div>
    </Modal>
  );
}
