import { CircleStackIcon } from '@heroicons/react/24/outline';

import { Button, Modal, ModalProps } from '@/components/common';

export function OutOfCoinWarning({ onCancel, ...rest }: ModalProps) {
  return (
    <Modal
      onCancel={onCancel}
      title={<span />}
      footer={<span />}
      width="460px"
      {...rest}
    >
      <div className="flex flex-col items-center px-4 pb-2">
        <CircleStackIcon className="w-[56px] h-[56px] text-red-500 mb-4" />

        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          Không đủ coins trong ví
        </h3>

        <p className="text-sm text-center text-gray-500 mb-8">
          <span>
            Bạn không có đủ coins trong ví để thực hiện hành động này.
          </span>

          <span>
            Tìm hiểu về{' '}
            <a
              href="https://blog.wele-learn.com/cac-cach-thuc-ban-co-the-kiem-them-wele-coins/"
              target="_blank"
              className="text-primary underline"
            >
              cách kiếm thêm
            </a>{' '}
            coins bạn nhé.
          </span>
        </p>

        <Button onClick={onCancel}>Tôi đã hiểu</Button>
      </div>
    </Modal>
  );
}
