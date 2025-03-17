'use client';

import {
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
  PlayIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button, Modal } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import Constants from '@/core/Constants';
import { useSourceByID } from '@/hooks/source';
import { useMe, useUser } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import { Helper } from '@/services/Helper';
import { Toast } from '@/services/Toast';
import { RawPodcast, RawPodcastSubmit } from '@/store/types';

function PodcastButton(props: { podcast: RawPodcast }) {
  const { data } = useMe();

  const { podcast } = props;

  const [openResubmitModal, setOpenResubmitModal] = useState(false);
  const [isResubmitting, setIsResubmitting] = useState(false);

  const pathName = usePathname();

  const resubmitInit = useCallback(
    async (metatype: string) => {
      try {
        setIsResubmitting(true);
        const res = await Fetch.postWithAccessToken<{
          podcast_submit: RawPodcastSubmit;
          code: number;
          message: string;
        }>('/api/podcast.submit/resubmit.init', {
          id: podcast.podcast_submit?.id,
          metatype: metatype || 'normal',
        });

        if (res.data.code && res.data.podcast_submit) {
          if (typeof window !== 'undefined') {
            window.location.href = Podcast.getListenURL(podcast, metatype);
          }
        } else {
          Toast.error(res.data.message);
        }
      } catch (error) {
        Toast.error('Something went wrong');
      } finally {
        setIsResubmitting(false);
      }
    },
    [podcast]
  );

  if (!data) {
    return (
      <Link href={`/authentication/login?from=${pathName}`}>
        <Button size="large" className="px-5">
          <UserIcon className="w-5 h-5" />
          Đăng nhập để nghe
        </Button>
      </Link>
    );
  }

  if (podcast.is_submitted) {
    return (
      <>
        <Link href={Podcast.getResultURL(podcast)}>
          <Button size="large" className="px-5">
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            Xem kết quả nghe
          </Button>
        </Link>

        <Button
          size="large"
          type="outline"
          onClick={() => setOpenResubmitModal(true)}
        >
          <ArrowPathIcon className="w-5 h-5" />
          Phục thù
        </Button>

        <Modal
          title="Bạn muốn phục thù ?"
          open={openResubmitModal}
          onCancel={() => setOpenResubmitModal(false)}
          okText="Delete"
          width="460px"
          footer={
            <div className="mt-4 flex justify-end items-center gap-2">
              <Button
                type="text"
                size="small"
                onClick={() => resubmitInit('normal')}
                loading={isResubmitting}
              >
                Phục thù không gợi ý
              </Button>

              <Button
                type="solid"
                size="small"
                onClick={() => resubmitInit('hint')}
                loading={isResubmitting}
              >
                Phục thù có gợi ý
              </Button>
            </div>
          }
        >
          <p className="text-sm text-gray-900 py-2">
            Vì WELE{' '}
            <a
              href="https://letrunghieuo8.wordpress.com/2024/06/21/ban-co-the-su-dung-wele-coins-de-lam-gi/"
              target="_blank"
              className="underline text-red-500 hover:text-gray-600"
            >
              không khuyến khích
            </a>{' '}
            người dùng nghe lại bài đã nộp, các bạn sẽ phải "nộp phạt"{' '}
            <span className="text-red-500">4 coins</span> nếu muốn phục thù.
          </p>
          <p className="text-sm text-gray-900">Hãy cân nhắc nhé!</p>
        </Modal>
      </>
    );
  }

  if (podcast.is_listening) {
    return (
      <Link href={Podcast.getListenURL(podcast)}>
        <Button size="large">
          <PlayIcon className="w-5 h-5" /> Tiếp tục nghe
        </Button>
      </Link>
    );
  }

  return (
    <>
      <Link href={Podcast.getListenURL(podcast, 'hint')}>
        <Button size="large">
          <img
            src="/static/svg/audio-book.svg"
            alt="headphone"
            className="w-5 h-5"
          />
          Nghe với gợi ý
        </Button>
      </Link>

      <Link href={Podcast.getListenURL(podcast, 'normal')}>
        <Button size="large" type="outline" className="px-5">
          <img
            src="/static/svg/headphones.svg"
            alt="headphone"
            className="w-5 h-5"
          />
          Nghe không gợi ý
        </Button>
      </Link>
    </>
  );
}

function PodcastSourceRender(props: { podcast: RawPodcast }) {
  const { podcast } = props;

  const source = useSourceByID(podcast.source_key);
  const user = useUser(podcast.user_id);

  return (
    <div className="flex flex-col gap-6 p-6 pt-0">
      {/* Author */}
      <div className="flex gap-3 items-center">
        {user?.data && <Avatar user={user.data} size={40} />}

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">Người đăng bài</span>
          <span className="text-sm font-medium text-gray-900">
            {user?.data?.fullname}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center border-b border-t border-gray-100 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Lượt nghe</span>
          <span className="text-sm font-medium text-gray-900">
            {Helper.formatNumber(podcast.views)}
          </span>
        </div>

        <span className="h-10 w-[1px] bg-gray-100" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Nguồn</span>
          <Link
            href={`/podcasts?source_keys=${podcast.source_key}`}
            className="text-sm font-medium text-gray-900"
          >
            {source?.name}
          </Link>
        </div>

        <span className="h-10 w-[1px] bg-gray-100" />

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600">Ngày đăng</span>
          <span className="text-sm font-medium text-gray-900">
            {dayjs(Number(podcast.since) * 1000).format('DD/MM/YYYY')}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-gray-900 font-medium">Disclaimer</p>
        <p className="text-sm text-gray-600">
          WELE does not own the rights to this content. All rights belong to the
          owner. WELE only use this content to help users learn English. Contact
          to request removal of content: welevietnam@gmail.com
        </p>
      </div>
    </div>
  );
}

function PodcastDownloadLinks(props: { podcast: RawPodcast }) {
  const { podcast } = props;

  return (
    <div className="mt-8">
      {podcast.download_link.length > 0 ? (
        <div className="mt-3">
          <h5 className="text-base font-bold text-gray-800">Downloads</h5>
          <ul>
            {podcast.download_link.map((link, index) => (
              <li key={index}>
                <Link
                  className="underline hover:text-primary transition-all"
                  href={`${link.link}`}
                  target="_blank"
                >
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function DisplayInfo(props: { podcast: RawPodcast }) {
  const { podcast } = props;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-4 [&>a]:w-1/2 [&>button]:w-1/2 [&>a>button]:w-full">
        <PodcastButton podcast={podcast} />
      </div>

      <div className="flex flex-col gap-6 bg-white rounded-lg border border-gray-100">
        <div className="px-2 pt-2 pb-1">
          <div
            className="w-full aspect-square bg-cover bg-center rounded-lg"
            style={{
              backgroundImage: `url(${Constants.IMAGE_URL + podcast.image_url})`,
            }}
          />
        </div>

        <PodcastSourceRender podcast={podcast} />
      </div>
    </div>
  );
}
