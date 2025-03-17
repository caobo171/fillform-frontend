import React, { useCallback, useState } from 'react';

import { Input, Modal } from '@/components/common';

interface AddCustomRatioModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onAddCustomRatio: (ratio: number) => void;
}

export const AddCustomRatioModal: React.FC<AddCustomRatioModalProps> = ({
  isOpen,
  setIsOpen,
  onAddCustomRatio,
}) => {
  const [ratio, setRatio] = useState<number>(0);

  const handleOk = useCallback(() => {
    onAddCustomRatio(ratio);
  }, [onAddCustomRatio, ratio]);

  return (
    <Modal
      onCancel={() => setIsOpen(false)}
      open={isOpen}
      title="Add custom ratio"
      onOk={handleOk}
    >
      <Input
        type="number"
        onChange={(e) => setRatio(parseInt(e.target.value, 10) || 0)}
      />
      Ratio: {ratio}
    </Modal>
  );
};
