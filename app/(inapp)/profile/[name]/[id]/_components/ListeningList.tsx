'use client';

import { useState } from 'react';

import { Button, Modal } from '@/components/common';
import LogEvent from '@/packages/firebase/LogEvent';
import { RawPodcast } from '@/store/types';

import { PodcastItem } from './PodcastItem';

export function ListeningList(props: { podcasts: RawPodcast[] }) {
  const { podcasts } = props;

  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white p-6">
        <div className="mx-[-8px] flex flex-col gap-6">
          {podcasts.slice().reverse().slice(0, 3).map((podcast) => (
            <PodcastItem key={podcast.id} podcast={podcast} />
          ))}

          <Button
            type="outline"
            className="w-full"
            onClick={() => {
              LogEvent.sendEvent('profile.see_all_activities');
              setOpenModal(true);
            }}
          >
            Xem tất cả ({podcasts?.length})
          </Button>
        </div>
      </div>

      <Modal
        open={openModal}
        onCancel={() => setOpenModal(false)}
        title="Tất cả podcasts"
        width="1200px"
      >
        <div className="mx-[-8px] flex flex-wrap gap-8 max-h-screen-80 overflow-y-auto custom-scrollbar mt-4">
          {podcasts.slice().reverse().map((podcast) => (
            <PodcastItem
              key={podcast.id}
              podcast={podcast}
              style={{ width: 'calc(33.33% - 22px)' }}
            />
          ))}
        </div>
      </Modal>
    </div>
  );
}
