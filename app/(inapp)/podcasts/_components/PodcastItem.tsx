import {
  HeartIcon,
  PlusIcon,
  QueueListIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import Link from 'next/link';
import React, { useMemo, useState } from 'react';

import { PlaylistModal } from '@/app/(inapp)/playlist/_components/PlaylistModal';
import { ProgressBar } from '@/app/(inapp)/podcasts/_components/ProgressBar';
import Constants from '@/core/Constants';
import { Podcast } from '@/modules/podcast/podcast';
import { Helper } from '@/services/Helper';
import {
  RawPodcast,
  RawPodcastCollection,
  RawPodcastSource,
} from '@/store/types';

dayjs.extend(relativeTime);

const actionButtonClasses =
  'h-7 w-7 outline-0 text-gray-600 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200';

const getTextContent = (html: string) => {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');

  return doc.body.textContent || '';
};

type PodcastItemProps = {
  data: RawPodcast;
  sources: RawPodcastSource[];
  collections: RawPodcastCollection[];
};

export function PodcastItem({ data, sources, collections }: PodcastItemProps) {
  const [openPlaylistModal, setOpenPlaylistModal] = useState<boolean>(false);

  const source = useMemo(() => {
    const s = sources.find((item) => item.id === data.source_key);

    return s?.name;
  }, [data.source_key, sources]);

  const collection = useMemo(() => {
    const c = collections.find(
      (item) =>
        Array.isArray(data.collections) &&
        String(item.id) === data.collections[0]
    );

    return c?.name;
  }, [collections, data]);

  return (
    <>
      <PlaylistModal
        open={openPlaylistModal}
        onCancel={() => setOpenPlaylistModal(false)}
        podcast={data}
      />

      <div className="w-full flex gap-4 pb-4 border-b border-gray-100">
        <Link
          href={Podcast.getURL(data)}
          className="block bg-cover bg-center rounded-lg ring-1 ring-gray-100 w-[120px] h-[120px]"
          style={{
            backgroundImage: `url(${Constants.IMAGE_URL}${data.image_url})`,
          }}
        />

        <div className="flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-semibold hover:underline">
              <Link href={Podcast.getURL(data)} className="block">
                {data.name}
              </Link>
            </h3>

            <span
              className="text-xs font-medium text-gray-500"
              title={dayjs(Number(data.since) * 1000).format('DD/MM/YYYY')}
            >
              {Helper.convertFromNowToVNText(
                dayjs(Number(data.since) * 1000).fromNow()
              )}
            </span>
          </div>

          <div className="text-xs text-gray-600 flex gap-4">
            <span>ESL {data.sub_name}</span>
            <span>{Helper.formatNumber(data.views)} lượt nghe</span>
            <span>{source}</span>
            <span>{collection}</span>
          </div>

          <p className="text-gray-600 text-sm line-clamp-1">
            {getTextContent(data.description)}
          </p>

          <div className="flex gap-4">
            <ProgressBar data={data} />

            <button title="Yêu thích" className={actionButtonClasses}>
              <HeartIcon className="w-4 h-4" />
              <span className="hidden">Like</span>
            </button>

            <button
              title="Thêm vào danh sách chờ"
              className={actionButtonClasses}
            >
              <QueueListIcon className="w-4 h-4" />
              <span className="hidden">Add to queue</span>
            </button>

            <button
              title="Thêm vào playlist"
              className={actionButtonClasses}
              onClick={() => setOpenPlaylistModal(true)}
            >
              <PlusIcon className="w-4 h-4" />
              <span className="hidden">Add to playlist</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
