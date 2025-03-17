import $ from 'jquery';
import { useEffect } from 'react';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';

export function usePlayerShortcut() {
  const {
    time_listen,
    play_rate,
    playing,
    audio,
    togglePlay,
    settings,
    goNextXSeconds,
    goPrevXSeconds,
  } = usePlayerContext();

  useEffect(() => {
    if (typeof window == 'undefined' || !window.document) {
      return;
    }

    $(window).on('keydown', (e) => {
      if (
        [settings.toggle_play, settings.next, settings.prev].indexOf(e.key) > -1
      ) {
        e.preventDefault();
        if (
          (e.ctrlKey || e.metaKey || e.shiftKey) &&
          e.key != 'Meta' &&
          e.key != 'Shift' &&
          e.key != 'Control'
        ) {
          // For entering number with input , using ctrl | shift | meta
          // @ts-ignore
          if (e.target.tagName == 'INPUT') {
            const input_element = e.target;
            // @ts-ignore
            const start = input_element.selectionStart;
            // @ts-ignore
            const end = input_element.selectionEnd;
            // @ts-ignore
            const text = input_element.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            // @ts-ignore
            input_element.value = before + e.key + after;
            // @ts-ignore
            input_element.selectionStart = input_element.selectionEnd =
              start + e.key.length;
            input_element.focus();
            e.preventDefault();
            return false;
          }

          const sel = document.getSelection();
          if (sel?.rangeCount) {
            e.preventDefault();

            const range = sel.getRangeAt(0);
            const new_node = document.createTextNode(e.key);
            range.insertNode(new_node);

            const start_offset = range.startOffset;
            const parent = new_node.parentNode;
            setTimeout(() => {
              if (parent && parent.childNodes.length) {
                const new_range = document.createRange();
                new_range.setStart(
                  parent.childNodes[0] as Node,
                  start_offset + 1
                );
                new_range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(new_range);
              }
            });
            return false;
          }
        }
      } else {
      }
      if (e.key == settings.toggle_play) {
        togglePlay(true);
      } else if (e.key == settings.prev) {
        goPrevXSeconds(true);
      } else if (e.key == settings.next) {
        goNextXSeconds(true);
      }
    });
    return () => {
      $(window).off('keydown');
    };
  }, [
    audio,
    playing,
    play_rate,
    time_listen,
    settings,
    togglePlay,
    goPrevXSeconds,
    goNextXSeconds,
  ]);
}
