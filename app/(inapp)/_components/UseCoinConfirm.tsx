import { CircleStackIcon } from '@heroicons/react/24/outline';

import { Button, Modal, ModalProps } from '@/components/common';

type UseCoinConfirmProps = {
  numberOfCoin?: number;
  description?: string | React.ReactNode;
} & ModalProps;

export function UseCoinConfirm({
  title,
  onCancel,
  onOk,
  description,
  numberOfCoin,
  okText,
  cancelText,
  ...rest
}: UseCoinConfirmProps) {
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
          {title ?? `-${numberOfCoin} coins`}
        </h3>

        <p className="text-sm text-center text-gray-500 mb-8">{description}</p>

        <div className="flex gap-2">
          <Button onClick={onCancel} type="text">
            {cancelText ?? 'Hủy'}
          </Button>

          <Button onClick={onOk}>{okText ?? 'Đồng ý'}</Button>
        </div>
      </div>
    </Modal>
  );
}
