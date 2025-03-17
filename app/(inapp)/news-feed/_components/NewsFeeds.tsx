'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

import { UserInfo } from '@/app/(inapp)/news-feed/_components/UserInfo';
import { Input, Loading } from '@/components/common';
import { Container } from '@/components/layout/container/container';
import Avatar from '@/components/ui/Avatar';
import { useMe } from '@/hooks/user';
import LogEvent from '@/packages/firebase/LogEvent';

import { ActionLogItem } from './ActionLogItem';
import { RecommendPodcasts } from './RecommendPodcasts';
import { Skeleton } from './Skeleton';
import useNewFeedsLoadMore from './_useNewFeedsLoadMore';

export function NewsFeeds() {
  const page_size = 20;
  const [page, setPage] = useState(1);
  const { data: me, isLoading } = useMe();

  const { on_loading, new_feeds, has_more } = useNewFeedsLoadMore(
    page,
    page_size
  );

  useEffect(() => {
    LogEvent.sendEvent('new_feeds.view');
  }, []);

  const observer = useRef<any>();
  const lastNewFeedElementRef = useCallback(
    (node: any) => {
      if (on_loading) return;
      if (observer.current) {
        observer.current.disconnect();
      }
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && has_more) {
          setPage((page) => page + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [on_loading, has_more]
  );

  if (isLoading) {
    return '';
  }

  return (
    <Container className="min-h-screen flex flex-col justify-between">
      <div className="w-full mt-8 flex items-start justify-center gap-8">
        {me && (
          <div className="sticky hidden xl:block w-3/12">
            <UserInfo data={me} />
          </div>
        )}

        <div id="new-feeds" className="w-full md:w-6/12">
          <div>
            {me && (
              <div className="flex items-center gap-2 mb-4 bg-white p-4 rounded-lg border border-gray-200">
                <Avatar user={me} size={40} />

                <Input
                  className="rounded-full"
                  inputClassName="rouned-full"
                  size="large"
                  placeholder="Share your thoughts..."
                />
              </div>
            )}
          </div>

          {new_feeds.map((action_log, index) => {
            if (new_feeds.length == index + 1) {
              return (
                <div
                  ref={lastNewFeedElementRef}
                  key={action_log.id}
                  className="w-full"
                >
                  <ActionLogItem action_log={action_log} />
                </div>
              );
            }

            return (
              <div key={action_log.id} className="w-full">
                <ActionLogItem action_log={action_log} />
              </div>
            );
          })}

          {on_loading && (
            <>
              {[1, 2].map((e) => (
                <Skeleton key={e} />
              ))}
            </>
          )}

          <div className="flex mt-20 mb-28 justify-center items-center">
            <div className="w-full py-1.5 flex items-center justify-center text-primary  font-medium">
              {on_loading ? <Loading className="text-primary" /> : null}
            </div>
          </div>
        </div>

        <div className="sticky hidden xl:block w-3/12">
          <RecommendPodcasts />
        </div>
      </div>
    </Container>
  );
}
