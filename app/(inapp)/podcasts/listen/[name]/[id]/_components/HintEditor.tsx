'use client';

import $ from 'jquery';
import React, { memo, useEffect, useState } from 'react';

import { FILLER_TEXT } from '@/core/Constants';
import hintHelpers, { legacySplitWords } from '@/helpers/hint';
import { RawPodcastSubmit } from '@/store/types';

interface Props {
  content_array: string[];
  setContentArray: (val: string[]) => void;
  submit: RawPodcastSubmit;
  version?: number;
}

const HintEditor = memo(
  ({ content_array, setContentArray, submit, version = 1 }: Props) => {
    const {
      shouldAddNoSpaceNext,
      shouldAddNoSpacePrevious,
      shouldAddNoSpaceWithAcronym,
      formatParagraph,
    } = hintHelpers;

    const [hintIndexes] = useState(submit.podcast_hints.sort((a, b) => a - b));

    const getQuoteIndexes = (word: string) => {
      const quoteIndexes = [];
      if (word !== `'`) {
        if (word[0] === `'`) quoteIndexes.push(0);
        if (word[word.length - 1] === `'`) quoteIndexes.push(word.length - 1);
      }
      return quoteIndexes;
    };

    const formatHintInput = (children: string, resultWord: string) => {
      // format hint input with special case of quote
      const quoteIndexes: number[] = getQuoteIndexes(resultWord);
      if (quoteIndexes.length === 2) return `'${children}'`;
      if (quoteIndexes.length === 1) {
        if (quoteIndexes[0] === 0) return `'${children}`;
        return `${children}'`;
      }
      return children;
    };

    const formatUserInput = (userWord: string, resultWord: string) => {
      const quoteIndexes = getQuoteIndexes(resultWord);
      let formattedUserWord = userWord;

      const formattedResultWordLength = resultWord.length - quoteIndexes.length;

      // remove special quote from user input
      if (userWord[0] === `'`) formattedUserWord = formattedUserWord.slice(1);
      if (userWord[userWord.length - 1] === `'`)
        formattedUserWord = formattedUserWord.slice(0, -1);

      // get the remaining placeholder
      const len = formattedResultWordLength - formattedUserWord.length;
      let placeholder = '';
      for (let i = 0; i < len; i++) {
        placeholder += '_';
      }

      return {
        formattedUserWord,
        placeholder,
        formattedResultWordLength,
      };
    };

    useEffect(() => {
      // convert ve cung mot kieu dau cach
      const text = submit.podcast_result;

      const contentWords =
        version >= 2
          ? Object.values(submit.result_array)
          : legacySplitWords(text);

      const legacyGetHtml = (hintIndexes: number[]) =>
        contentWords
          .map((e, index) => {
            const hintIndex = hintIndexes.indexOf(index);

            if (hintIndex <= -1) {
              return contentWords[index].includes('\n')
                ? `<br>${contentWords[index]}`
                : contentWords[index];
            }

            const trimWord = (content_array[hintIndex] || '').trim();
            const word =
              trimWord && trimWord != FILLER_TEXT
                ? content_array[hintIndex]
                : '';

            const resultWord = contentWords[index]
              .replace(/[\,\?\!\;\:\.\"]/g, '')
              .trim();
            const len = resultWord.length - word.length;
            let placeholder = '';
            for (let i = 0; i < len; i++) {
              placeholder += '_';
            }
            const brTag = contentWords[index].includes('\n') ? '<br>' : '';
            return `${brTag}<span class='hint-word'>
              <input autocapitalize='off' data-index='${hintIndex}' maxlength='${resultWord.length}' data-length='${resultWord.length}' style='width: ${resultWord.length}ch' class='js-hint-input'  value="${word}"/>
              <div class='slot-indicator'>${placeholder}</div>
            </span>`;
          })
          .join(' ');

      const getSpanTag = (resultWord: string, index: number) => {
        const value =
          submit.draft_array.length > 0
            ? submit.draft_array[index]
            : content_array[index];
        const trimWord = (value || '').trim();
        const userWord = trimWord && trimWord != FILLER_TEXT ? value : '';

        const { formattedUserWord, placeholder, formattedResultWordLength } =
          formatUserInput(userWord, resultWord);

        return formatHintInput(
          `<span class='hint-word'>
          <input autocapitalize='off' data-index='${index}' maxlength='${formattedResultWordLength}' data-length='${formattedResultWordLength}' style='width: ${formattedResultWordLength}ch' class='js-hint-input'  value="${formattedUserWord}"/>
          <div class='slot-indicator'>${placeholder}</div>
        </span>`,
          resultWord
        );
      };

      const getHtml = (hintIndexes: number[]) => {
        let resultString = '';
        for (let i = 0; i < contentWords.length; i++) {
          const removeEnterValue = contentWords[i].replace('\n', '');
          const convertedValue = hintIndexes.includes(i)
            ? getSpanTag(removeEnterValue, i)
            : removeEnterValue;

          if (contentWords[i].includes('\n')) {
            resultString += '<br/>';
          }

          if (!convertedValue) continue;

          if (
            contentWords[i + 1] == undefined ||
            shouldAddNoSpaceNext(contentWords[i], contentWords[i + 1]) ||
            (!!contentWords[i - 1] &&
              shouldAddNoSpacePrevious(contentWords[i - 1], contentWords[i])) ||
            shouldAddNoSpaceWithAcronym(contentWords[i], contentWords[i + 2])
          ) {
            resultString += convertedValue;
          } else {
            resultString += `${convertedValue} `;
          }
        }

        return resultString;
      };

      const html =
        version >= 2 ? getHtml(hintIndexes) : legacyGetHtml(hintIndexes);

      $('.js-content').html(html);

      $('.js-hint-input').each(function () {
        const that = this;
        $(this)[0].addEventListener('textInput', (e) => {
          let index = Number($(that).data('index'));
          // @ts-ignore
          const input = e.data;
          if (input == ' ') {
            if (version >= 2) {
              const currentIndex = hintIndexes.indexOf(index);
              if (currentIndex < hintIndexes.length - 1) {
                index = hintIndexes[currentIndex + 1];
              }
            } else if (hintIndexes.length > index + 1) {
              index += 1;
            }
            $(`.js-hint-input[data-index=${index}]`).focus();
            e.preventDefault();
          }
        });
      });

      // Controll the caret
      $('.js-hint-input').on('keydown', function (e) {
        let index = Number($(this).data('index'));
        if (e.key == 'Enter' || e.key == 'ArrowRight' || e.key == ' ') {
          e.preventDefault();
          if (version >= 2) {
            const currentIndex = hintIndexes.indexOf(index);
            if (currentIndex < hintIndexes.length - 1) {
              index = hintIndexes[currentIndex + 1];
            }
          } else if (hintIndexes.length > index + 1) {
            index += 1;
          }
        }

        if (
          e.key == 'ArrowLeft' ||
          (e.key == 'Backspace' && $(this).val() == '')
        ) {
          e.preventDefault();
          if (version >= 2) {
            const currentIndex = hintIndexes.indexOf(index);
            if (currentIndex > 0) {
              index = hintIndexes[currentIndex - 1];
            }
          } else if (index > 0) {
            index -= 1;
          }
        }

        $(`.js-hint-input[data-index=${index}]`).focus();
      });

      // Show hide slots
      $('.js-hint-input').on('change input', function (e) {
        // @ts-ignore
        const slots_len = $(this).data('length') - $(this).val().length;
        let slots = '';
        for (let i = 0; i < slots_len; i++) {
          slots += '_';
        }

        if (e.key == 'Enter' || e.key == 'ArrowRight' || e.key == ' ') {
        } else {
          // if (slots_len == 0){
          // 	var index = Number($(this).data('index'));
          // 	if (hintIndexes.length > (index + 1)) {
          // 		index = index + 1;
          // 	}
          // 	$(`.js-hint-input[data-index=${index}]`).focus();
          // }
        }

        $(this).closest('.hint-word').find('.slot-indicator').html(slots);
      });

      // Update values
      $('.js-hint-input').on('change', (_) => {
        let newContentArray: string[];
        if (version >= 2) {
          const hints = submit.podcast_hints;
          newContentArray = Object.keys(contentWords).map((value) => {
            let val = $(`.js-hint-input[data-index=${Number(value)}]`).val();
            val = formatParagraph((val || '').toString().trim());
            const word = contentWords[Number(value)];

            return val
              ? formatHintInput(val, word)
              : hints.includes(Number(value))
                ? FILLER_TEXT
                : word;
          });
        } else {
          newContentArray = hintIndexes.map((_, index) => {
            let val = $(`.js-hint-input[data-index=${index}]`).val();
            val = (val || '').toString().trim();

            return val || FILLER_TEXT;
          });
        }

        setContentArray(newContentArray);
      });

      // const next

      return () => {
        $('.js-hint-input').off('keydown');
      };
    }, [submit]);

    return (
      <div
        style={{ borderWidth: 1, fontFamily: `monospace` }}
        // using text-base on mobile to prevent auto zoom
        className="px-3 py-3 js-content border-gray-200 hint-wrapper rounded-lg bg-white text-base sm:text-sm"
      />
    );
  },
  () => true
);

export default HintEditor;
