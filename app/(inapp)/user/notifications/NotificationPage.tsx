'use client';

import moment from 'moment';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { toast } from 'react-toastify';

import { Loading } from '@/components/common';
import Constants, { Code, LAYOUT_TYPES } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import UI from '@/services/UI';
import { AnyObject } from '@/store/interface';
import { RawNotification } from '@/store/types';
import { UserHook } from '@/store/user/hooks';

import useNotificationsLoadMore from './_components/_userNotificationsLoadmore';
import './notification.css';

function ContentNotification({
  notification,
}: {
  notification: RawNotification;
}) {
  const [noti, setNoti] = useState(notification);
  const [loading, setLoading] = useState(0);

  const onResponse = async (option: string) => {
    try {
      setLoading(option.split('.')[0] === 'accept' ? 1 : 2);
      const url = `/api/team.challenge/${option}`;
      const res = await Fetch.postWithAccessToken<{
        notification: RawNotification;
        message: string;
        code: number;
      }>(url, { notification_id: notification.id });
      if (res && res.data) {
        if (res.data.code === Code.SUCCESS) {
          setNoti(res.data.notification);
          toast.success(`${option.split('.').join(' ')} successful`);
        } else {
          toast.error(res.data.message);
        }
      }
    } catch (err) {
      toast.error('ERROR!');
    }
    setLoading(0);
  };

  if (noti.link && noti.link.toLowerCase().startsWith('http') && noti.content) {
    return (
      <Link
        target="_blank"
        className="cursor-pointer inline-block text-gray-500 hover:text-gray-700 transition-all"
        href={notification.link}
      >
        <span dangerouslySetInnerHTML={{ __html: noti.content }} />
      </Link>
    );
  }

  if (noti.content) {
    return (
      <div className="text-sm flex flex-col gap-1 flex-1">
        <Link
          className="notification-link cursor-pointer text-gray-700 hover:text-gray-900 transition-all"
          href={noti.link ? noti.link : ''}
        >
          <p
            className="line-clamp-2"
            dangerouslySetInnerHTML={{ __html: noti.content }}
          />
        </Link>

        <div className="flex gap-4">
          <span
            className="text-gray-500"
            title={moment((noti.since ?? 0) * 1000).format('lll')}
          >
            {Helper.convertFromNowToVNText(
              moment((noti.since ?? 0) * 1000).fromNow()
            )}
          </span>

          {(noti.action === 'invite' || noti.action === 'request') && (
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                onClick={() => onResponse(`accept.${noti.action}`)}
                className="flex items-center gap-0.5 font-medium text-primary cursor-pointer hover:text-primary-800"
              >
                {loading === 1 && <Loading className="text-primary" />}
                Chấp nhận
              </span>

              <span className="h-1 w-1 rounded bg-gray-300" />

              <span
                aria-hidden="true"
                onClick={() => onResponse(`decline.${noti.action}`)}
                className="flex items-center gap-0.5 font-medium text-gray-700 cursor-pointer hover:text-gray-500"
              >
                {loading === 2 && <Loading className="text-gray-500" />}
                Từ chối
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}

function NotificationItem({ notification }: { notification: RawNotification }) {
  return (
    <div
      id={`noti_${notification.id}`}
      className="py-4 border-b border-gray-150"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center">
          {notification.image ? (
            <div
              className="bg-contain bg-no-repeat bg-center h-[56px] w-[56px] rounded-full"
              style={{
                backgroundImage: `url("${Constants.IMAGE_URL + Helper.normalizeUrl(notification.image)}")`,
              }}
            />
          ) : (
            <div
              className="flex items-center justify-center h-[56px] w-[56px] rounded-full"
              style={{
                backgroundColor: UI.getColorByString(
                  notification.from_name ? notification.from_name : 'Admin'
                ),
              }}
            >
              <span className="text-lg text-white">
                {(notification.from_name
                  ? notification.from_name
                  : 'Admin'
                ).slice(0, 2)}
              </span>
            </div>
          )}
        </div>

        <ContentNotification notification={notification} />
      </div>
    </div>
  );
}

function Index() {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    on_loading: onLoading,
    notifications,
    has_more: hasMore,
  } = useNotificationsLoadMore(page, pageSize);

  UserHook.useFetchUsers([...notifications.map((e) => e.user_id)]);

  const observer = useRef<AnyObject>();

  const lastNotificationElementRef = useCallback(
    (node: HTMLDivElement) => {
      if (onLoading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((p) => p + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [onLoading, hasMore]
  );

  return (
    <div className="flex-1 flex flex-col bg-white p-6 rounded-lg">
      <div className="mb-8">
        <h1 className="text-base font-semibold leading-6 text-gray-900">
          Thông báo ({notifications.length})
        </h1>

        <p className="mt-2 text-sm text-gray-700">Tất cả thông báo của bạn</p>
      </div>

      <div className="">
        {notifications.map((notification, index) => {
          if (notifications.length === index + 1) {
            return (
              <div key={notification.id} ref={lastNotificationElementRef}>
                <NotificationItem notification={notification} />
              </div>
            );
          }

          return (
            <div key={notification.id}>
              <NotificationItem notification={notification} />
            </div>
          );
        })}

        {onLoading && <Loading className="text-primary" />}
      </div>
    </div>
  );
}

Index.layout = LAYOUT_TYPES.Profile;

export default Index;
