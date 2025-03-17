'use client';

import React from 'react';

import { Modal } from '@/components/common';
import { AnyObject } from '@/store/interface';

import { SummarizeWords } from './SummarizeWords';

export function ResultModal({ open, close, summarizeWords }: AnyObject) {
  return (
    <Modal
      open={open}
      onCancel={close}
      onOk={close}
      width="500px"
      title="Từ nghe sai"
      cancelButtonProps={{ className: 'hidden' }}
    >
      <div className="max-h-screen-80 overflow-y-auto">
        <SummarizeWords summarizeWords={summarizeWords} />
      </div>
    </Modal>
  );
}
