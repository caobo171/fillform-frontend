'use client';

import {
  ArrowPathRoundedSquareIcon,
  BackwardIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ForwardIcon,
} from '@heroicons/react/24/outline';
import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import clsx from 'clsx';
import React, { useContext, useEffect, useMemo } from 'react';

import { Select } from '@/components/common';
import { QueueContext } from '@/contexts';
import { PlayerContext } from '@/contexts/PlayerContext';
import { QueueAction } from '@/contexts/QueueContext';
import DateUtil from '@/services/Date';

import './player.css';

const PLAYER_RATE_SETTINGS = [0.5, 0.7, 1, 1.2, 1.5, 1.8, 2];

export function Player() {
  const { queue, setQueue } = useContext(QueueContext);

  const {
    audio,
    isLooping,
    playing,
    playRate,
    changePlayRate,
    timeListen,
    toggleLooping,
    togglePlay,

    onSliding,
    goPrevXSeconds,
    goNextXSeconds,
  } = useContext(PlayerContext);

  const isDisablePreviousButton = useMemo(() => {
    const { podcasts, playing: playingPodcast } = queue;

    const currentIndex = podcasts.findIndex(
      (item) => item.id === playingPodcast?.id
    );

    return currentIndex === 0;
  }, [queue]);

  const isDisableNextButton = useMemo(() => {
    const { podcasts, playing: playingPodcast } = queue;

    const currentIndex = podcasts.findIndex(
      (item) => item.id === playingPodcast?.id
    );

    return currentIndex === podcasts.length - 1;
  }, [queue]);

  const playPreviousPodcast = () => {
    setQueue({ type: QueueAction.PlayPrevious });
  };

  const playNextPodcast = () => {
    setQueue({ type: QueueAction.PlayNext });
  };

  useEffect(() => {
    if (
      playing &&
      !isLooping &&
      audio?.duration &&
      timeListen >= audio?.duration
    ) {
      const currentIndex = queue.podcasts?.findIndex(
        (item) => item.id === queue.playing?.id
      );

      const nextPodcast = queue.podcasts[currentIndex + 1];

      if (nextPodcast) {
        setQueue({ type: QueueAction.UpdatePlaying, playing: nextPodcast });
      }
    }
  }, [timeListen, playing, isLooping, setQueue]);

  return (
    <div className="w-auto">
      {audio && (
        <div className="flex flex-col gap-1 items-center">
          <div className="flex justify-center items-center gap-1 md:gap-4">
            <span
              aria-hidden="true"
              onClick={toggleLooping}
              className={`hidden md:block cursor-pointer ${isLooping ? 'text-primary hover:text-primary-900' : 'text-gray-500 hover:text-gray-900'}`}
              title="Lặp lại"
            >
              <ArrowPathRoundedSquareIcon className="w-5 h-5" />
            </span>

            <span
              aria-hidden="true"
              onClick={playPreviousPodcast}
              className={clsx(
                'hover:text-gray-900 cursor-pointer',
                isDisablePreviousButton
                  ? 'pointer-events-none text-gray-300'
                  : 'text-gray-500'
              )}
              title="Bài trước"
            >
              <BackwardIcon className="w-5 h-5" />
            </span>

            <span
              aria-hidden="true"
              onClick={() => goPrevXSeconds(false)}
              className="text-gray-500 hover:text-gray-900 cursor-pointer"
              title="Tua lại"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </span>

            <span
              aria-hidden="true"
              onClick={() => togglePlay(false)}
              className="text-primary cursor-pointer hover:text-primary-900"
            >
              {playing ? (
                <PauseCircleIcon className="w-10 h-10" title="Tạm dừng" />
              ) : (
                <PlayCircleIcon className="w-10 h-10" title="Nghe tiếp" />
              )}
            </span>

            <span
              aria-hidden="true"
              onClick={() => goNextXSeconds(false)}
              className="text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <ChevronRightIcon className="w-5 h-5" title="Tua đi" />
            </span>

            <span
              aria-hidden="true"
              onClick={playNextPodcast}
              className={clsx(
                'hover:text-gray-900 cursor-pointer',
                isDisableNextButton
                  ? 'pointer-events-none text-gray-300'
                  : 'text-gray-500'
              )}
              title="Bài tiếp"
            >
              <ForwardIcon className="w-5 h-5" />
            </span>

            <Select
              options={PLAYER_RATE_SETTINGS.map((item) => ({
                label: `${item}x`,
                value: item,
              }))}
              onChange={(val) => changePlayRate(parseFloat(val.toString()))}
              value={Math.floor(playRate * 10) / 10}
              popupClassName="bottom-10 w-[80px] h-auto max-h-none overflow-visible"
              labelClassName="bg-transparent ring-0 pr-8"
            />
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-500">
              {DateUtil.displayTime(timeListen)}
            </p>

            <div className="relative slider-container w-[100px] md:w-[630px] translate-y-[-2px]">
              <span className="bar absolute top-0 left-0 z-1 cursor-pointer w-full h-1 rounded-full overflow-hidden bg-gray-300">
                <span
                  className="fill block w-0 h-full bg-primary"
                  style={{
                    width: audio?.duration
                      ? `${(timeListen / audio.duration) * 100}%`
                      : 'auto',
                  }}
                />
              </span>

              <input
                id="slider"
                type="range"
                min={0}
                max={Number.isNaN(audio.duration) ? 1 : audio.duration}
                value={timeListen}
                onChange={onSliding}
                className="slider absolute top-0 left-0 z-2 cursor-pointer appearance-none w-full h-1 rounded-full outline-none bg-transparent"
              />
            </div>

            <p className="text-xs text-gray-500">
              {DateUtil.displayTime(audio.duration)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
