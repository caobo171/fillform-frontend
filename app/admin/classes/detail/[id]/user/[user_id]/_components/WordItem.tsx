import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { SpeakerWaveIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import React, { memo, useMemo, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Modal } from '@/components/common';
import LogEvent from '@/packages/firebase/LogEvent';
import Voice from '@/services/Voice';
import { ReferenceWrongWord, ReportWordType } from '@/store/types';

import { WrongWordChunk } from './WrongWordChunk';

function WordReferenceItem(props: { word: ReferenceWrongWord }) {
  const [openModal, setOpenModal] = useState(false);

  return (
    <div className="flex-1 line-clamp-1 text-sm flex items-center gap-2">
      <SpeakerWaveIcon
        onClick={() => {
          LogEvent.sendEvent('record.play_audio_your_word');
          if (props.word.index < 0) {
            Voice.speak(props.word.user_word);
          } else {
            setOpenModal(true);
          }
        }}
        className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
      />

      <Modal
        title="Reference"
        width="500px"
        open={openModal}
        onCancel={() => setOpenModal(false)}
      >
        <WrongWordChunk
          wordIndex={props.word.index}
          podcastId={props.word.podcast_id}
          userId={props.word.user_id}
        />
      </Modal>
      <span title={props.word.user_word}> {props.word.user_word}</span>
    </div>
  );
}

const WordDetail = memo((props: { data: ReportWordType }) => {
  const { data } = props;
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <span
        className="text-sm text-gray-500 w-[80px] text-center hover:cursor-pointer"
        onClick={() => setIsOpen(true)}
      >
        Chi tiết
      </span>
      {isOpen && (
        <Modal
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          title={data.label}
          width="700px"
          onOk={() => setIsOpen(false)}
        >
          <div className="flex flex-wrap gap-1">
            {(data?.statsFreq?.split('') || []).reverse().map((val) => (
              <span
                key={Math.random()}
                className={clsx(
                  'w-5 h-5 rounded-full',
                  { 'bg-green-500': val === '1' },
                  { 'bg-red-500': val === '0' }
                )}
              />
            ))}
          </div>
        </Modal>
      )}
    </>
  );
});

const RecordIndicators = memo(
  ({
    statsFreq,
    maximumSampleSize,
  }: {
    statsFreq: string;
    maximumSampleSize: number;
  }) => {
    const displayFreq = useMemo(() => {
      return statsFreq.slice(
        statsFreq.length <= maximumSampleSize
          ? 0
          : statsFreq.length - maximumSampleSize,
        statsFreq.length
      );
    }, [statsFreq, maximumSampleSize]);

    return (
      <div className="flex items-center justify-end gap-1 w-[200px]">
        {displayFreq.split('').map((val, index) => (
          <span
            key={`indicator-${index}`}
            className={clsx(
              'w-3 h-3 rounded-full',
              { 'bg-green-500': val === '1' },
              { 'bg-red-500': val === '0' }
            )}
          />
        ))}
      </div>
    );
  }
);

type WordItemProps = {
  data: ReportWordType;
  style?: React.CSSProperties;
  className?: string;
  showRate?: boolean;
  showRateRecord?: boolean;
  allowToShowReference?: boolean;
};

export function WordItem(props: WordItemProps) {
  const [maximumSampleSize] = useState(10);

  const {
    data,
    style,
    className,
    showRate,
    showRateRecord,
    allowToShowReference,
  } = props;

  const [showReference, setShowReference] = useState<boolean>(false);

  const rateValue = useMemo(() => {
    return showRate
      ? `${Number((Number(data?.freq ?? 0) * 100).toFixed(2))}%`
      : Math.abs(Number(data?.freq));
  }, [data?.freq, showRate]);

  return (
    <div className={twMerge(className)} style={style}>
      <div className="w-full py-2 flex items-center gap-2 border-b border-gray-200">
        <div className="flex-1 line-clamp-1 text-sm flex items-center gap-2">
          <SpeakerWaveIcon
            onClick={() => {
              LogEvent.sendEvent('record.play_audio_your_word');
              Voice.speak(data.label);
            }}
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-900"
          />
          <span title={data.label}>{data.label}</span>
        </div>

        <div className="w-[80px] text-right">
          <span className="text-gray-900 text-sm">
            {rateValue}
          </span>
        </div>

        {showRateRecord && data?.statsFreq && (
          <RecordIndicators
            statsFreq={data.statsFreq}
            maximumSampleSize={maximumSampleSize}
          />
        )}

        {showRateRecord && (
          <div className="w-[80px] flex justify-center">
            {(data?.statsFreq?.length || 0) > maximumSampleSize && (
              <WordDetail data={data} />
            )}
          </div>
        )}

        {allowToShowReference && (
          <ChevronDownIcon
            className="w-5 h-5 cursor-pointer text-gray-500 hover:text-gray-700"
            onClick={() => setShowReference(!showReference)}
          />
        )}
      </div>

      {data?.references && showReference && (
        <div className="flex flex-col gap-1.5 pl-4 pt-2">
          {data.references.map((word) => (
            <WordReferenceItem key={word.user_word} word={word} />
          ))}
        </div>
      )}
    </div>
  );
}
