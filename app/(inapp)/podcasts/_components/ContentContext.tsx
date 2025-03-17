'use client';
import Constants, { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Podcast } from '@/modules/podcast/podcast';
import LogEvent from '@/packages/firebase/LogEvent';
import { RawPodcast, RawPodcastSubmit, RawUserActionLog } from '@/store/types';
import React, {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import { useAsync } from 'react-use';
import * as uuid from 'uuid';
import { usePlayerContext } from './PlayerContext';

const AUTO_SAVE_DELAY = 60;

const ContenContext = React.createContext({
  content: '',
  content_array: [] as string[],
  setContent: (content: string) => { },
  setContentArray: (content_array: string[]) => { },
  action_log: null as RawUserActionLog | null | undefined,
  setLockUpdate: (value: boolean) => { },
});

export const useContentContext = () => useContext(ContenContext);

export const ContentContextProvider = (
  props: PropsWithChildren<{
    podcast: RawPodcast;
    podcast_submit: RawPodcastSubmit;
    setLockUpdate?: (value: boolean) => void;
  }>
) => {
  const { podcast, podcast_submit } = props;

  const { time_listen } = usePlayerContext();

  const [content, setContent] = useState(podcast_submit.draft);
  const [content_array, setContentArray] = useState(
    Podcast.getContentArray(podcast_submit, podcast_submit.version)
  );

  const [is_lock_update, setLockUpdate] = useState(false)


  const [auto_saved, setAutoSaved] = useState(0);
  // Auto save interval
  useEffect(() => {
    let counter = auto_saved;
    const interval = setInterval(() => {
      counter++;
      console.log('Auto saved');
      setAutoSaved(counter);
      return;
    }, AUTO_SAVE_DELAY * 1000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const action_log = useAsync(async () => {
    const res = await Fetch.postWithAccessToken<{
      user_action_log: RawUserActionLog;
      code: number;
    }>('/api/user.action.log/get', {
      id: -1,
      podcast_id: props.podcast.id,
    });

    if (res.status == 200) {
      if (res.data && res.data.code === Code.SUCCESS) {
        return {
          user_action_log: res.data.user_action_log,
        };
      }
    }
    return null;
  }, []);

  // Auto save effect
  useEffect(() => {
    if (is_lock_update) return;
    if (content == '' && !content_array.length) return;

    if (!auto_saved || document.hidden) return;
    try {
      Fetch.postWithAccessToken<{ code: number; message: string }>(
        '/api/podcast.submit/update',
        {
          id: podcast_submit.id,
          current_time_listen: time_listen,
          content_array: JSON.stringify(content_array),
          draft:
            podcast_submit.metatype == 'hint'
              ? Podcast.getResultContent(podcast_submit, content_array)
              : content,
        }
      );

      // update action log
      if (!action_log.value) {
        console.log("Update action log error: action haven't started yet");
        return;
      }

      Fetch.postWithAccessToken('/api/user.action.log/update', {
        id: action_log.value.user_action_log.id,
        podcast_id: podcast.id,
      });

      // fire signal to request reload me listening time
      // no async await for posting log above, so need to delay this a bit
      setTimeout(() => {
        window.postMessage('requireReloadMeListeningTime');
      }, 5000);
    } catch { }
    return;
  }, [auto_saved, is_lock_update]);

  return (
    <ContenContext.Provider
      value={{
        content,
        content_array,
        setContent,
        setContentArray,
        action_log: action_log.value?.user_action_log,
        setLockUpdate: setLockUpdate,
      }}
    >
      {props.children}
    </ContenContext.Provider>
  );
};
