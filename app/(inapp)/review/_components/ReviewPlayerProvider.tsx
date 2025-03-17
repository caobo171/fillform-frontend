'use client';

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as uuid from 'uuid';

import Constants from '@/core/Constants';
import LogEvent from '@/packages/firebase/LogEvent';
import { AnyObject } from '@/store/interface';
import { PlayerContext } from '@/contexts/PlayerContext';
import { range } from 'lodash';


type PlayerProviderProps = {
  children: React.ReactNode;
  range: { start: number, end: number };
  audio_url: string;
};

export function ReviewPlayerProvider({ children, ...props }: PlayerProviderProps) {

  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [playRate, setPlayRate] = useState(1);
  const [amountTimeAdjust, setAmountTimeAdjust] = useState(5);
  const [isLooping, setLooping] = useState(false);
  // Keyboard settings
  const [settings, setSettings] = useState({
    toggle_play: '1',
    prev: '2',
    next: '3',
  });

  // State of audio
  const [playing, setPlaying] = useState(false);
  const [timeListen, setTimeListening] = useState(0);

  // UI
  const [resetInterval, setResetInterval] = useState('');

  useEffect(() => {
    let newAudio = audio;

    if (audio) {
      newAudio?.setAttribute(
        'src',
        props.audio_url
      );
    } else {
      newAudio = new Audio(props.audio_url);
    }

    setAudio(newAudio);

    const currentSettings = localStorage.getItem('keyboard_listen_settings');

    if (currentSettings) {
      setSettings(JSON.parse(currentSettings));
    }

    const currentTimeAdjust = localStorage.getItem('time_adjust');

    if (currentTimeAdjust) {
      setAmountTimeAdjust(Number(currentTimeAdjust));
    }
    

    return () => {
      if (newAudio) {
        newAudio.pause();
        newAudio.removeAttribute('src');
        newAudio.remove();
      }
    }
  }, [props.audio_url, props.range.end + '_' + props.range.start]);


  const changeCurrentTime = useCallback(
    async (current: number, play: boolean = true) => {

      if (
        audio &&
        !Number.isNaN(audio.duration) &&
        current >= 0 &&
        current <= audio.duration
      ) {
        audio.currentTime = current;

        if (play) {
          await audio.play();
          setPlaying(play);
        }

        setTimeListening(current);
        setResetInterval(uuid.v4());
      }
    },
    [audio, props.range.end + '_' + props.range.start]
  );

  const onChangeAdjustTime = useCallback(async (e: AnyObject) => {
    LogEvent.sendEvent('global.listen.change_time_adjust');

    localStorage.setItem('time_adjust', Number(e.target.value).toString());

    setAmountTimeAdjust(Number(e.target.value));
  }, []);

  const changePlayRate = useCallback(
    (value: number) => {
      LogEvent.sendEvent(`global.listen.play_rate_${value}`);
      if (audio) {
        audio.playbackRate = value;
        setPlayRate(value);
      }
    },
    [audio, props.range.end + '_' + props.range.start]
  );

  const onChangeSettingKeyboard = useCallback(
    async (e: AnyObject) => {
      LogEvent.sendEvent('global.listen.change_listen_settings');

      const newSettings = { ...settings };

      newSettings[e.target.name as 'toggle_play' | 'prev' | 'next'] =
        e.target.value;

      setSettings(newSettings);

      localStorage.setItem(
        'keyboard_listen_settings',
        JSON.stringify(newSettings)
      );
    },
    [settings]
  );

  const goPrevXSeconds = useCallback(
    (fromKey: boolean) => {
      if (!fromKey) {
        LogEvent.sendEvent('global.listen.go_prev_button');
      } else {
        LogEvent.sendEvent('global.listen.go_prev_key');
      }
      changeCurrentTime(Math.max(0, timeListen - amountTimeAdjust));
    },
    [amountTimeAdjust, changeCurrentTime, timeListen]
  );

  const togglePlay = useCallback(
    async (fromKey: boolean = false) => {
      if (!fromKey) {
        LogEvent.sendEvent('global.listen.toggle_play_button');
      } else {
        LogEvent.sendEvent('global.listen.toggle_play_key');
      }

      if (audio) {
        if (!playing) {
          await audio?.play();
          setPlaying(true);
        } else {
          audio?.pause();
          setPlaying(false);
        }
      }
    },
    [audio, playing]
  );

  const goNextXSeconds = useCallback(
    (fromKey: boolean = false) => {
      if (!fromKey) {
        LogEvent.sendEvent('global.listen.go_next_button');
      } else {
        LogEvent.sendEvent('global.listen.go_next_key');
      }

      changeCurrentTime(timeListen + amountTimeAdjust);
    },
    [amountTimeAdjust, changeCurrentTime, timeListen]
  );

  const toggleLooping = useCallback(() => {
    setLooping(!isLooping);
  }, [isLooping]);


  const onSliding = useCallback(
    (e: AnyObject) => {
      console.log(e.target.value);
      changeCurrentTime(Number(e.target.value), false);
    },
    [changeCurrentTime]
  );

  // Interval for change time listening
  useEffect(() => {
    let currentTime = timeListen;

    const intervalTime = 1000 / (Math.floor(playRate * 10) / 10);

    const interval = setInterval(() => {
      if (playing) {
        if (audio && !!audio.duration) {
          if (currentTime < audio.duration) {
            currentTime = Number(audio.currentTime);
            setTimeListening(currentTime);
          } else if (isLooping) {
            changeCurrentTime(0);
          } else {
            clearInterval(interval);
            setPlaying(false);
          }
        }
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
    };
  }, [playing, resetInterval, playRate, isLooping, audio?.src]);

  useEffect(() => {
    const loadHandler = () => changeCurrentTime(props?.range.start || 0, true);

    const timeupdateHandler = () => {
      if (props?.range.end) {
        if (audio?.currentTime && audio?.currentTime >= props?.range.end) {
          audio.currentTime = props?.range.start || 0;
          setTimeListening(audio.currentTime);
          audio.pause();
          setPlaying(false);
        }
      }
    }

    if (audio?.src) {
      audio.addEventListener('loadedmetadata', loadHandler);
      audio.addEventListener('timeupdate', timeupdateHandler);
    }

    return () => {
      audio?.removeEventListener('loadedmetadata', loadHandler);
      audio?.removeEventListener('timeupdate', timeupdateHandler);
    };
  }, [audio, audio?.src, props.range.end + '_' + props.range.start]);

  const contextValue = useMemo(
    () => ({
      timeListen,
      playing,
      audio,
      playRate,
      amountTimeAdjust,
      isLooping,
      settings,
      togglePlay,
      changeCurrentTime,
      onChangeSettingKeyboard,
      onChangeAdjustTime,
      onSliding,
      changePlayRate,
      goNextXSeconds,
      goPrevXSeconds,
      toggleLooping,
      range: props.range,
    }),
    [
      amountTimeAdjust,
      audio,
      changeCurrentTime,
      changePlayRate,
      goNextXSeconds,
      goPrevXSeconds,
      isLooping,
      onChangeAdjustTime,
      onChangeSettingKeyboard,
      onSliding,
      playRate,
      playing,
      settings,
      timeListen,
      toggleLooping,
      togglePlay,
      props.range,
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}
