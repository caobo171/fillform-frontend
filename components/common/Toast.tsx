import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from '@heroicons/react/20/solid';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCallback } from 'react';
import { IconProps, ToastContainer, Zoom } from 'react-toastify';

import { AnyObject } from '@/store/interface';

import './Toast.css';

export function ToastContextHolder() {
  const CloseButton = useCallback(
    ({ closeToast }: AnyObject) => (
      <XMarkIcon
        className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
        onClick={closeToast}
      />
    ),
    []
  );

  const renderIcon = useCallback((iconProps: IconProps) => {
    if (iconProps.type === 'warning') {
      return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }

    if (iconProps.type === 'success') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    }

    if (iconProps.type === 'info') {
      return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
    }

    if (iconProps.type === 'error') {
      return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
    }

    return null;
  }, []);

  return (
    <ToastContainer
      className="toast-container"
      toastClassName="toast-wrapper"
      bodyClassName="toast-body"
      closeButton={CloseButton}
      transition={Zoom}
      hideProgressBar
      icon={(iconProps) => renderIcon(iconProps)}
    />
  );
}
