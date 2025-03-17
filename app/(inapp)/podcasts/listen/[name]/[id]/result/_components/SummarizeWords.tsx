'use client';

import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ChevronUpIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import Voice from '@/services/Voice';
import { ReferenceWrongWord } from '@/store/types';

type Props = {
  summarizeWords: WordProps[];
};

type WordProps = {
  label: string;
  freq: number;
  references: ReferenceWrongWord[];
};

export function SummarizeWords({ summarizeWords }: Props) {
  const [selected_correct_word, setCorrectWord] = useState(-1);

  return (
    <div className="w-full flex-1 flex flex-col gap-2">
      {summarizeWords &&
        summarizeWords.map((e, index) => (
          <WordItem
            key={index}
            word={e}
            selected_correct_word={selected_correct_word}
            setCorrectWord={setCorrectWord}
            index={index}
          />
        ))}
    </div>
  );
}

type WordItemProps = {
  index: number;
  word: WordProps;
  setCorrectWord: (index: number) => void;
  selected_correct_word: number;
};
const WordItem = React.memo((props: WordItemProps) => (
  <div>
    <div className="flex items-center justify-between text-sm text-gray-900 py-2 border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="text-gray-400">{props.index + 1}.</span>

        <span title={props.word.label}>{props.word.label}</span>

        <SpeakerWaveIcon
          className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-900"
          onClick={() => Voice.speak(props.word.label)}
        />
      </div>

      <div
        aria-hidden="true"
        className="flex items-center cursor-pointer gap-2"
        onClick={() =>
          props.setCorrectWord(
            props.selected_correct_word === props.index ? -1 : props.index
          )
        }
      >
        <span className="">{props.word.freq}</span>

        <span className="ml-2 cursor-pointer text-gray-500">
          {props.selected_correct_word === props.index ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronUpIcon className="w-4 h-4" />
          )}
        </span>
      </div>
    </div>

    <CSSTransition
      unmountOnExit
      timeout={300}
      in={props.index == props.selected_correct_word}
      classNames="css-dropdown"
    >
      <div className="w-full pl-10 flex gap-4 flex-wrap">
        {props.word.references.map((wrong_text, idx) => (
          <div key={idx} className="flex gap-2 items-center text-sm py-2">
            <span className="text-gray-400">{idx + 1}.</span>
            <span className="text-sm" title={wrong_text.user_word}>
              {wrong_text.user_word}
            </span>

            <SpeakerWaveIcon
              className="w-4 h-4 cursor-pointer text-gray-500 hover:text-gray-900"
              onClick={() => Voice.speak(wrong_text.user_word)}
            />
          </div>
        ))}
      </div>
    </CSSTransition>
  </div>
));
