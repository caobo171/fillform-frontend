'use client';

import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { PodcastActions } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastActions';
import { PodcastCurrentListeners } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastCurrentListeners';
import { PodcastEditor } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastEditor';
import { PodcastListenSetting } from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/PodcastListenSetting';
import { Code } from '@/core/Constants';
import Cookie from '@/lib/core/fetch/Cookie';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import LogEvent from '@/packages/firebase/LogEvent';
import { RawUserActionLog } from '@/store/types';
import {
  useContentContext
} from '@/app/(inapp)/podcasts/_components/ContentContext';
import { MeHook } from '@/store/me/hooks';

export const PodcastContent = (props: {
  current_action_logs: RawUserActionLog[];
}) => {
  const { current_action_logs } = props;

  const [onLoadingSaveProgress, setOnLoadingSaveProgress] = useState(false);

  const {
    podcast,
    podcast_submit: podcastSubmit,
    time_listen: timeListen,
  } = usePlayerContext();

  const {
    action_log: actionLog,
    content_array: contentArray,
    content,
    setLockUpdate,
  } = useContentContext();

  const me = MeHook.useMe();

  const onSaveProgress = async () => {
    setOnLoadingSaveProgress(true);
    LogEvent.sendEvent('listen.save_progress');
    try {
      if (!Cookie.fromDocument('access_token')) {
        toast.error('Access token is not binded');
        return;
      }

      const res = await Fetch.postWithAccessToken<{
        code: number;
        message: string;
      }>('/api/podcast.submit/update', {
        id: podcastSubmit.id,
        current_time_listen: timeListen,
        draft:
          podcastSubmit.metatype === 'hint'
            ? Podcast.getResultContent(podcastSubmit, contentArray)
            : content,
        content_array: JSON.stringify(contentArray),
      });

      // update action log
      if (!actionLog) {
        return;
      }

      Fetch.postWithAccessToken('/api/user.action.log/update', {
        id: actionLog.id,
        podcast_id: podcast.id,
      });

      setOnLoadingSaveProgress(false);
      if (res.status === 200) {
        if (res.data && res.data.code === Code.SUCCESS) {
          toast.success('Saved Process!');
          return;
        }
        toast.error(res.data.message);
        return;
      }
    } catch (err) {
      console.log(err);
    }

    setOnLoadingSaveProgress(false);
    toast.error('Some errors occurred');
  };

  return (
    <>
      <PodcastActions
        onSaveProgress={onSaveProgress}
        onLoadingSaveProgress={onLoadingSaveProgress}
        podcast={podcast}
        podcastSubmit={podcastSubmit}
        timeListen={timeListen}
        actionLog={actionLog}
        contentArray={contentArray}
        content={content}
        setLockUpdate={setLockUpdate}
        me={me}
      />

      <div className="flex gap-10">
        <div className="w-full mb-2 md:w-2/3">
          <PodcastEditor />

          <PodcastCurrentListeners current_action_logs={current_action_logs} />
        </div>

        <PodcastListenSetting onClickReportIssue={onSaveProgress} />
      </div>

      <PodcastActions
        floating
        onSaveProgress={onSaveProgress}
        onLoadingSaveProgress={onLoadingSaveProgress}
        podcast={podcast}
        podcastSubmit={podcastSubmit}
        timeListen={timeListen}
        actionLog={actionLog}
        contentArray={contentArray}
        content={content}
        setLockUpdate={setLockUpdate}
        me={me}
      />
    </>
  );
};
