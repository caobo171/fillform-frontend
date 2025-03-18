'use client';

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { uniqBy } from 'lodash';
import Link from 'next/link';
import { useMemo } from 'react';

import { Section } from '@/app/(inapp)/home/_components/Section';
import useNewFeedsLoadMore from '@/app/(inapp)/news-feed/_components/_useNewFeedsLoadMore';
import Avatar from '@/components/ui/Avatar';
import { USER_ACTION_METATYPE } from '@/core/Constants';
import { useUser } from '@/hooks/user';
import { Podcast } from '@/modules/podcast/podcast';
import { Helper } from '@/services/Helper';
import { RawPodcast, RawUser, RawUserActionLog } from '@/store/types';

dayjs.extend(relativeTime);

function NewsItem({ data }: { data: RawUserActionLog }) {
  const { data: userData } = useUser(data.user_id);

  const user = (userData ?? {}) as RawUser;

  const status = useMemo(() => {
    if (data.metatype === USER_ACTION_METATYPE.METATYPE_CERTIFICATE) {
      return <span className="text-violet-600">Vừa nhận 1 danh hiệu</span>;
    }

    if (data.metatype === USER_ACTION_METATYPE.METATYPE_MILESTONE) {
      return (
        <span className="text-red-600">Hoàn thành {data.content} podcasts</span>
      );
    }

    if (data.metatype === USER_ACTION_METATYPE.METATYPE_LISTENING) {
      if (
        data.end_time &&
        Math.floor((data.end_time - data.start_time) / 60) > 10
      ) {
        return <span className="text-yellow-500">Đang nghe</span>;
      }

      return <span className="text-lime-600">Bắt đầu nghe</span>;
    }

    if (data.metatype === USER_ACTION_METATYPE.METATYPE_SUBMIT) {
      return <span className="text-red-600">Đã nộp</span>;
    }

    return null;
  }, [data]);

  return (
    <div className="flex items-center gap-2 rounded-lg bg-white p-2 border border-gray-100">
      <Avatar user={user} />

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <Link
            href={`/profile/${userData?.username}/${userData?.id}`}
            className="text-xs text-gray-900 hover:text-gray-600"
          >
            {user.fullname}
          </Link>

          <span className="w-1 h-1 rounded-full bg-gray-400" />

          <div className="text-xs text-gray-500">
            {Helper.convertFromNowToVNText(
              dayjs(data.start_time * 1000).fromNow()
            )}
          </div>
        </div>

        <Link
          href={Podcast.getURL({
            name: data.podcast_name,
            sub_name: data.podcast_sub_name,
            id: data.podcast_id,
          } as unknown as RawPodcast)}
          className="flex items-center gap-2 text-sm"
        >
          {status}

          <span className="flex-1 line-clamp-1 text-gray-900">
            {data.podcast_name}
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function NewsFeed() {
  const { on_loading: loading, new_feeds: news } = useNewFeedsLoadMore(1, 20);

  const top5UniqNews = useMemo(
    () => uniqBy(news, 'user_id').slice(0, 5),
    [news]
  );

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        <div className="w-[150px] h-[24px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4, 5].map((item) => (
            <div
              key={`weekly_ranking_${item}`}
              className="h-[40px] w-full rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Section
      title="Bảng tin"
      seeMoreLink="/news-feed"
      className="gap-3"
      titleClassName="text-base"
      seeMoreClassName="text-xs"
    >
      <div className="flex flex-col gap-2">
        {top5UniqNews.map((item) => (
          <NewsItem key={`log_${item.id}`} data={item} />
        ))}
      </div>
    </Section>
  );
}
