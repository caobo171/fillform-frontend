import { PlusIcon } from '@heroicons/react/24/outline';
import { memo, useState } from 'react';

import { PlaylistModal } from '@/app/(inapp)/playlist/_components/PlaylistModal';
import { RawPodcast } from '@/store/types';

export const AddToPlaylistButton = memo(
  ({ className, podcast }: { className: string; podcast: RawPodcast }) => {
    const [open, setOpen] = useState(false);
    const closeModal = () => setOpen(false);

    return (
      <>
        <div
          title="Thêm vào playlist"
          aria-hidden="true"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className={className}
        >
          <PlusIcon className="w-5 h-5" />
        </div>
        <PlaylistModal podcast={podcast} open={open} onCancel={closeModal} />
      </>
    );
  }
);

AddToPlaylistButton.displayName = 'AddToPlaylistButton';
