import { useCallback, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RawSystemAnnoucement } from '@/store/types';
import Constants from '@/core/Constants';
import { Helper } from '@/services/Helper';
import { Fragment } from 'react';

interface AnnouncementDialogProps {
  announcement?: RawSystemAnnoucement;
  onClose: () => void;
  open: boolean;
}

export function AnnouncementDialog({ announcement, onClose, open }: AnnouncementDialogProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (open && announcement) {
      setShowDialog(true);
      setImageLoaded(false); // Reset image loaded state when dialog opens
    } else {
      setShowDialog(false);
    }
  }, [open, announcement]);

  const handleClose = useCallback(() => {
    setShowDialog(false);
    onClose();
  }, [onClose]);

  const handleLinkClick = useCallback(() => {
    if (announcement?.link) {
      window.open(announcement.link, '_blank', 'noopener,noreferrer');
    }
  }, [announcement]);
  
  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  if (!announcement) {
    return null;
  }

  return (
    <Transition appear show={showDialog} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={handleClose}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        </Transition.Child>
        
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="mx-auto max-w-xl rounded-lg bg-white shadow-xl transform transition-all">
          <div className="relative">
            <button
              type="button"
              className="absolute top-2 right-2 z-10 rounded-md bg-white/80 p-1 text-gray-400 hover:text-gray-500"
              onClick={handleClose}
            >
              <span className="sr-only">Đóng</span>
              <XMarkIcon className="h-6 w-6" aria-hidden="true" />
            </button>
            
            {announcement.image && (
              <div 
                className={`relative w-full min-h-32 sm:min-h-96 sm:max-w-1/2 overflow-hidden rounded-t-lg ${announcement.link ? 'cursor-pointer' : ''}`}
                onClick={announcement.link ? handleLinkClick : undefined}
              >
                {/* Loading skeleton */}
                {!imageLoaded && (
                  <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-t-lg" />
                )}
                <img
                  src={Constants.IMAGE_URL + announcement.image}
                  alt="Announcement"
                  className="w-full h-full object-cover"
                  onLoad={handleImageLoad}
                  style={{ opacity: imageLoaded ? 1 : 0 }}
                />
              </div>
            )}
            

            {
              Helper.purify(announcement.content) && (
                <div className="p-6">
                  <div 
                    className="prose max-w-none"
                    dangerouslySetInnerHTML={{ __html: announcement.content }}
                  />
                </div>
              )
            }
            

          </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
