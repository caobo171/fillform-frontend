import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import React, { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, ButtonProps } from './Button';
import { useWindowSize } from '@uidotdev/usehooks';

export type ModalProps = {
  open: boolean;
  onCancel: () => void;
  onOk?: () => void;
  title?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  okButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  width?: string;
  panelClassName?: string;
  headerClassName?: string;
};

export function Modal(props: ModalProps) {
  const {
    open,
    onCancel,
    onOk,
    title,
    okText,
    cancelText,
    okButtonProps,
    cancelButtonProps,
    children,
    footer,
    width = '440px',
    panelClassName,
    headerClassName,
  } = props;


  const windowSize = useWindowSize();

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-start justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={twMerge(
                  'w-full transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all',
                  panelClassName
                )}
                style={{ width: (windowSize.width || 0) < 800 ? 'unset' : width }}
              >
                {/* header */}
                <Dialog.Title
                  as="h3"
                  className={twMerge(
                    'text-lg font-medium leading-6 text-gray-900 flex justify-between',
                    headerClassName
                  )}
                >
                  {title}

                  <XMarkIcon
                    className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900 ml-auto"
                    onClick={onCancel}
                  />
                </Dialog.Title>

                {/* body */}
                <div className="mt-2">{children}</div>

                {/* footer */}
                {footer ?? (
                  <div className="mt-4 flex justify-end items-center gap-2">
                    <Button
                      type="text"
                      size="small"
                      onClick={onCancel}
                      {...cancelButtonProps}
                    >
                      {cancelText ?? 'Cancel'}
                    </Button>

                    <Button
                      type="solid"
                      size="small"
                      onClick={onOk}
                      {...okButtonProps}
                    >
                      {okText ?? 'Ok'}
                    </Button>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
