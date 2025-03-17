'use client';

import $ from 'jquery';
import React, { memo, useEffect, useState } from 'react';

import { FILLER_TEXT } from '@/core/Constants';
import hintHelpers, { legacySplitWords } from '@/helpers/hint';
import { RawPodcastSubmit } from '@/store/types';

interface Props {
  content_array: string[];
  setContentArray: (val: string[]) => void;
  result: string[];
  hint_indexes: number[];
  reload: string;
}

const ListeningEditor = memo(
  ({ content_array, setContentArray, result, hint_indexes, reload }: Props) => {
    const {
      shouldAddNoSpaceNext,
      shouldAddNoSpacePrevious,
      shouldAddNoSpaceWithAcronym,
    } = hintHelpers;

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
      const text = result;

      const contentWords = text;

      const getSpanTag = (resultWord: string, index: number) => {
        const value = content_array[index];
        const trimWord = (value || '').trim();
        const userWord = trimWord && trimWord != FILLER_TEXT ? value : '';

        const { formattedUserWord, placeholder, formattedResultWordLength } =
          formatUserInput(userWord, resultWord);

        return formatHintInput(
          `<span class='hint-word'>
          <input data-index='${index}' maxlength='${formattedResultWordLength}' data-length='${formattedResultWordLength}' style='width: ${formattedResultWordLength}ch' class='js-hint-input'  value="${formattedUserWord}"/>
          <div class='slot-indicator'>${placeholder}</div>
        </span>`,
          resultWord
        );
      };

      const getHtml = (hint_indexes: number[]) => {
        let resultString = '';
        for (let i = 0; i < contentWords.length; i++) {
          const removeEnterValue = contentWords[i].replace('\n', '');
          const convertedValue = hint_indexes.includes(i)
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

      const html = getHtml(hint_indexes);


      $('.js-content').html(html);

      $('.js-hint-input').each(function () {
        let that = this;
        $(this)[0].addEventListener('textInput', function (e) {
          let index = Number($(that).data('index'));
          //@ts-ignore
          const input = e.data;
          if (input == ' ') {
            const currentIndex = hint_indexes.indexOf(index);
            if (currentIndex < hint_indexes.length - 1) {
              index = hint_indexes[currentIndex + 1];
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
          const currentIndex = hint_indexes.indexOf(index);
          if (currentIndex < hint_indexes.length - 1) {
            index = hint_indexes[currentIndex + 1];
          }
        }

        if (
          e.key == 'ArrowLeft' ||
          (e.key == 'Backspace' && $(this).val() == '')
        ) {
          e.preventDefault();
          const currentIndex = hint_indexes.indexOf(index);
          if (currentIndex > 0) {
            index = hint_indexes[currentIndex - 1];
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
          if (slots_len == 0) {
            var index = Number($(this).data('index'));
            if (hint_indexes.length > (index + 1)) {
              index = index + 1;
            }
            $(`.js-hint-input[data-index=${index}]`).focus();
          }
        }

        $(this).closest('.hint-word').find('.slot-indicator').html(slots);
      });

      // Update values
      $('.js-hint-input').on('change', (_) => {
        let newContentArray: string[];
        const hints = hint_indexes;
        newContentArray = Object.keys(contentWords).map((value) => {
          let val = $(`.js-hint-input[data-index=${Number(value)}]`).val();
          val = (val || '').toString().trim();
          const word = contentWords[Number(value)];

          return val
            ? formatHintInput(val, word)
            : hints.includes(Number(value))
              ? FILLER_TEXT
              : word;
        });

        setContentArray(newContentArray);
      });

      // const next

      return () => {
        $('.js-hint-input').off('keydown');
      };
    }, [result.join(''), hint_indexes.join(''), reload]);


    return (
      <div
        style={{ borderWidth: 1, fontFamily: `monospace` }}
        // using text-base on mobile to prevent auto zoom
        className="px-3 py-3 js-content border-gray-200 hint-wrapper rounded-lg bg-white text-base sm:text-sm"
      />
    );
  },
  (a, b) => a.result.join('') === b.result.join('') && a.hint_indexes.join('') === b.hint_indexes.join('') && a.content_array.join('') === b.content_array.join('')
);

export default ListeningEditor;
