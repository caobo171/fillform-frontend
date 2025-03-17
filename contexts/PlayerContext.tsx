'use client';

import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import * as uuid from 'uuid';

import { QueueContext } from '@/contexts/QueueContext';
import Constants from '@/core/Constants';
import LogEvent from '@/packages/firebase/LogEvent';
import { AnyObject } from '@/store/interface';

type PlayerContextProps = {
  timeListen: number;
  playing: boolean;
  audio: HTMLAudioElement | undefined;
  playRate: number;
  amountTimeAdjust: number;
  isLooping: boolean;
  settings: {
    toggle_play: string;
    prev: string;
    next: string;
  };

  range?: { start: number; end: number };

  togglePlay: (value: boolean) => void;
  changeCurrentTime: (current: number, play: boolean) => void;
  onChangeSettingKeyboard: (value: AnyObject) => void;
  changePlayRate: (value: number) => void;
  onSliding: (value: AnyObject) => void;
  goNextXSeconds: (value: boolean) => void;
  goPrevXSeconds: (value: boolean) => void;
  toggleLooping: () => void;
  onChangeAdjustTime: (value: AnyObject) => void;
};

export const PlayerContext = React.createContext<PlayerContextProps>({
  settings: {
    toggle_play: '1',
    prev: '2',
    next: '3',
  },
  timeListen: 0,
  playing: false,
  audio: undefined,
  playRate: 1,
  amountTimeAdjust: 5,
  isLooping: false,

  togglePlay: () => {},
  changeCurrentTime: () => {},
  onChangeSettingKeyboard: () => {},
  onSliding: () => {},
  changePlayRate: () => {},
  goNextXSeconds: () => {},
  goPrevXSeconds: () => {},
  toggleLooping: () => {},

  onChangeAdjustTime: () => [],
});

type PlayerProviderProps = {
  children: React.ReactNode;
};

export function PlayerProvider({ children }: PlayerProviderProps) {
  const { queue } = useContext(QueueContext);

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

  useMemo(() => {
    if (!queue.playing) {
      return;
    }

    let newAudio = audio;

    if (audio) {
      newAudio?.setAttribute(
        'src',
        Constants.IMAGE_URL + queue.playing.file_path
      );
    } else {
      newAudio = new Audio(Constants.IMAGE_URL + queue.playing.file_path);
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
  }, [queue.playing]);

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
    [audio]
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
    [audio]
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
      changeCurrentTime(Math.max( 0, timeListen - amountTimeAdjust));
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
            currentTime = Number(currentTime.toString()) + 1;
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
  }, [playing, resetInterval, playRate, isLooping]);

  useEffect(() => {
    const loadHandler = () => changeCurrentTime(0, true);

    if (audio?.src) {
      audio.addEventListener('loadedmetadata', loadHandler);
    }

    return () => audio?.removeEventListener('loadedmetadata', loadHandler);
  }, [audio, audio?.src]);

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
    ]
  );

  return (
    <PlayerContext.Provider value={contextValue}>
      {children}
    </PlayerContext.Provider>
  );
}
