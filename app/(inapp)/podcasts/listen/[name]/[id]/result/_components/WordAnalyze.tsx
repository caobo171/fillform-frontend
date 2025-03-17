'use client';

import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useMemo, useState } from 'react';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { Button } from '@/components/common';
import Voice from '@/services/Voice';
import { ReferenceWrongWord } from '@/store/types';

import { ResultModal } from './ResultModal';
import { SummarizeWords } from './SummarizeWords';

export function WordAnalyze() {
  const [openModal, setOpenModal] = useState(false);
  const { podcast, podcast_submit } = usePlayerContext();

  useEffect(() => {
    Voice.init();
  }, []);

  const summarizeWords = useMemo(() => {
    const wrongWords: {
      [key: string]: {
        references: ReferenceWrongWord[];
        freq: number;
      };
    } = {};

    const keys = Object.keys(podcast_submit.compare_result.wrong_phrases);
    keys.forEach((key) => {
      if (!wrongWords[key]) {
        wrongWords[key] = {
          references: [],
          freq: 0,
        };
      }

      for (
        let i = 0;
        i < podcast_submit.compare_result.wrong_phrases[key].length;
        i++
      ) {
        const wrongPhraseRef =
          podcast_submit.compare_result.wrong_phrases[key][i];

        wrongWords[key].references.push({
          podcast_id: podcast_submit.podcast_id,
          index: typeof wrongPhraseRef === 'string' ? -1 : wrongPhraseRef.index,
          user_word:
            typeof wrongPhraseRef === 'string'
              ? wrongPhraseRef
              : wrongPhraseRef.user_word,
        });
      }

      wrongWords[key].freq +=
        podcast_submit.compare_result.wrong_phrases[key].length;
    });

    return Object.keys(wrongWords).map((key) => ({
      label: key,
      freq: wrongWords[key].freq,
      references: wrongWords[key].references,
    }));
  }, [podcast_submit, podcast]);

  return (
    <div className="w-full h-full flex flex-col px-6 py-4 gap-6 rounded-lg text-gray-900 bg-white">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
          <ExclamationTriangleIcon className="w-5 h-5 text-white" />
        </div>

        <h3 className="font-semibold text-xl flex-1">Từ nghe sai</h3>

        <span className="text-sm">Tần suất</span>
      </div>

      <SummarizeWords summarizeWords={summarizeWords.slice(0, 3)} />

      <div className="flex justify-center">
        <Button onClick={() => setOpenModal(true)} type="outline">
          Xem tất cả
        </Button>
      </div>

      <ResultModal
        summarizeWords={summarizeWords}
        open={openModal}
        close={() => setOpenModal(false)}
      />
    </div>
  );
}
