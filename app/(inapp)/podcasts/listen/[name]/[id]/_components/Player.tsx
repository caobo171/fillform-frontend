'use client';

import {
  ArrowPathRoundedSquareIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { PauseCircleIcon, PlayCircleIcon } from '@heroicons/react/24/solid';
import $ from 'jquery';
import React, { useEffect } from 'react';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { Select } from '@/components/common';
import DateUtil from '@/services/Date';

import './player.css';

const PLAYER_RATE_SETTINGS = [0.5, 0.7, 1, 1.2, 1.5, 1.8, 2];

export function PodcastPlayer() {
  const {
    audio,
    is_looping: isLooping,
    playing,
    play_rate: playRate,
    changePlayRate,
    time_listen: timeListen,
    toggleLooping,
    togglePlay,

    onSliding,
    goPrevXSeconds,
    goNextXSeconds,
  } = usePlayerContext();

  useEffect(() => {
    const $fill = $('.bar .fill');
    if (audio && audio.duration) {
      $fill.css('width', `${(timeListen / audio.duration) * 100}%`);
    }
  }, [timeListen]);

  return (
    <div className="w-full md:w-auto max-w-full">
      {audio && (
        <div className="flex flex-col gap-1 items-center">
          <div className="flex justify-center items-center gap-1 md:gap-4">
            <span
              aria-hidden="true"
              onClick={toggleLooping}
              className={`cursor-pointer ${isLooping ? 'text-primary hover:text-primary-900' : 'text-gray-500 hover:text-gray-900'}`}
              title="Lặp lại"
            >
              <ArrowPathRoundedSquareIcon className="w-5 h-5" />
            </span>

            <span
              aria-hidden="true"
              onClick={goPrevXSeconds}
              className="text-gray-500 hover:text-gray-900 cursor-pointer"
              title="Tua lại"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </span>

            <span
              aria-hidden="true"
              onClick={togglePlay}
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
              onClick={goNextXSeconds}
              className="text-gray-500 hover:text-gray-900 cursor-pointer"
            >
              <ChevronRightIcon className="w-5 h-5" title="Tua đi" />
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

          <div className="flex items-center gap-3 max-w-full">
            <p className="text-xs text-gray-500">
              {DateUtil.displayTime(timeListen)}
            </p>

            <div className="relative slider-container w-[250px] lg:w-[630px] translate-y-[-2px] max-w-full">
              <span className="bar absolute top-0 left-0 z-1 cursor-pointer w-full h-1 rounded-full overflow-hidden bg-gray-300">
                <span className="fill block w-0 h-full bg-primary" />
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
