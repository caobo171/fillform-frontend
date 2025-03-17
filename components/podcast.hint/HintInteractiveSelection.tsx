'use client';

import $ from 'jquery';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import {
  HintHelpers,
  getParagraphTextWithHint,
  legacySplitWords,
} from '@/helpers/hint';

import { GENERATE_TYPE } from '../../core/Constants';

interface HintObject {
  [key: number]: string;
}

interface HintInteractiveSelectionProps {
  paragraph: string;
  onChangeHintIndexes: (indexes: number[]) => void;
  version?: number;
  hint_indexes: number[];
}

const {
  splitWords,
  shouldAddNoSpaceNext,
  shouldAddNoSpacePrevious,
  replaceWordWithUnderline,
  shouldAddNoSpaceWithAcronym,
} = HintHelpers;

/**
 * @desc Component for user to click to get tag hint
 * @param param0
 * @returns
 */
const HintInteractiveSelection: React.FC<HintInteractiveSelectionProps> = ({
  paragraph,
  onChangeHintIndexes,
  hint_indexes,
  version = 1,
}) => {
  const ref = useRef<HTMLParagraphElement>(null);
  const [newHintObjects, setNewHintObjects] = useState<HintObject>({});

  const legacyOnClickTag = (event: any) => {
    const index = parseInt($(event.target).data('id'));
    if (!newHintObjects[index]) {
      setNewHintObjects({
        ...newHintObjects,
        [index]: event.target.textContent,
      });
    } else {
      const newHintObjectsCopy = { ...newHintObjects };
      delete newHintObjectsCopy[index];
      setNewHintObjects(newHintObjectsCopy);
    }
  };

  const paragraph_words = useMemo(() => splitWords(paragraph), [paragraph]);

  const onClickTagEvent = (event: any) => {
    if (HintHelpers.hasSpecialPunctuation(event.target.textContent)) return;

    const index = parseInt($(event.target).data('id'));

    const clone_indexes = hint_indexes.slice();
    const index_of = clone_indexes.indexOf(index);
    if (index_of > -1) {
      clone_indexes.splice(index_of, 1);
    } else {
      clone_indexes.push(index);
    }
    onChangeHintIndexes(clone_indexes);
  };

  const hintText = useMemo(() => {
    let paragraphCopy = paragraph;
    const newHintIndexes = Object.keys(newHintObjects).map((key) =>
      parseInt(key)
    );

    const hintIndexes = newHintIndexes.length > 0 ? newHintIndexes : [];

    paragraphCopy = getParagraphTextWithHint(paragraph, hintIndexes);
    return paragraphCopy.replace(/\n/g, '<br/>');
  }, [newHintObjects, paragraph]);

  /**
   * @desc Show the paragraph with blank positions match with hint indexes in HTML, user can interact with this
   */
  useEffect(() => {
    let result_string = '';

    if (!ref.current) {
      return;
    }

    if (version < 2) {
      return;
    }

    for (let i = 0; i < Object.keys(paragraph_words).length; i++) {
      // Remove enter value in a word
      const removed_enter_value = paragraph_words[i].replace('\n', '');

      // If the word is hint, replace it with underline
      const converted_value = hint_indexes.includes(i)
        ? replaceWordWithUnderline(removed_enter_value)
        : removed_enter_value;

      // If the word is enter, add a new line tag to the result string
      if (paragraph_words[i].includes('\n')) {
        result_string += '<br/>';
      }

      // If empty string , ignore it
      if (!converted_value) continue;

      if (
        paragraph_words[i + 1] === undefined ||
        shouldAddNoSpaceNext(paragraph_words[i], paragraph_words[i + 1]) ||
        (!!paragraph_words[i - 1] &&
          shouldAddNoSpacePrevious(
            paragraph_words[i - 1],
            paragraph_words[i]
          )) ||
        shouldAddNoSpaceWithAcronym(paragraph_words[i], paragraph_words[i + 2])
      ) {
        result_string += `<span data-id='${i}' class='cursor-pointer text-lg hover:bg-yellow-200 js-text-word'>${converted_value}</span>`;
      } else {
        result_string += `<span data-id='${i}' class='cursor-pointer text-lg hover:bg-yellow-200 js-text-word'>${converted_value}</span> `;
      }
    }

    $(ref.current).html(result_string);
    $(ref.current)
      .find('.js-text-word')
      .on('click', (event) => onClickTagEvent(event));
  }, [paragraph_words, hint_indexes, ref]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (version < 2) {
      const $wrapper = $(ref.current);
      const words = legacySplitWords(hintText);
      const words_html = words
        .map(
          (
            word,
            index
          ) => `<span class='cursor-pointer text-lg hover:bg-yellow-200 js-text-word' data-id='${index}'>
          ${word}
        </span>`
        )
        .join(' ');

      $wrapper.html(words_html);
      $wrapper
        .find(`.js-text-word`)
        .on('click', (event) => legacyOnClickTag(event));
    } else {
    }

    return () => {};
  }, [ref, paragraph, hintText]);

  return <p ref={ref} />;
};

export default HintInteractiveSelection;
