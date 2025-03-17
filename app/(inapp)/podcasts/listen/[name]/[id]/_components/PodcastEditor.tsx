'use client';

import { usePlayerContext } from '../../../../_components/PlayerContext';
import { ReactQuillNoSSR } from '@/components/form/NoSSR';
import HintEditor from '@/app/(inapp)/podcasts/listen/[name]/[id]/_components/HintEditor';
import $ from 'jquery';
import { useEffect, useState } from 'react';
import { useContentContext } from '../../../../_components/ContentContext';
import './editor.css';
import { Helper } from '@/services/Helper';

const modules = {
  toolbar: [['bold', 'italic', 'underline', 'strike']],
};

const formats = [
  'header',
  'bold',
  'italic',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
];

export function PodcastEditor() {
  const {
    podcast,
    podcast_submit,
    time_listen,
    play_rate,
    playing,
    audio,
    togglePlay,
    settings,
    goNextXSeconds,
    goPrevXSeconds,
  } = usePlayerContext();

  const { content, content_array, setContent, setContentArray } =
    useContentContext();


  useEffect(() => {
    if (!window.document) {
      return;
    }



    $(window).on('keydown', (e) => {
      if (
        [settings.toggle_play, settings.next, settings.prev].indexOf(e.key) > -1
      ) {
     
        if (
          (e.ctrlKey || e.metaKey || e.shiftKey) &&
          e.key != 'Meta' &&
          e.key != 'Shift' &&
          e.key != 'Control'
        ) {
          e.preventDefault();
          // For entering number with input , using ctrl | shift | meta
          //@ts-ignore
          if (e.target.tagName == 'INPUT') {
            const input_element = e.target;
            //@ts-ignore
            const start = input_element.selectionStart;
            //@ts-ignore
            const end = input_element.selectionEnd;
            //@ts-ignore
            const text = input_element.value;
            const before = text.substring(0, start);
            const after = text.substring(end, text.length);
            //@ts-ignore
            input_element.value = before + e.key + after;
            //@ts-ignore
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
            setTimeout(function () {
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


      // @ts-ignore
      if (window.ReactNativeWebView) {
        return;
      }

      if (Helper.isMobileDevice()) {
        return;
      }

      if (e.key == settings.toggle_play) {
        e.preventDefault();
        togglePlay(true);
      } else if (e.key == settings.prev) {
        e.preventDefault();
        goPrevXSeconds(true);
      } else if (e.key == settings.next) {
        e.preventDefault();
        goNextXSeconds(true);
      }
    });
    return () => {
      $(window).off('keydown');
    };
  }, [audio, playing, play_rate, time_listen, settings]);


  return (
    <div className="w-full js-text-writing">
      {podcast_submit.metatype == 'hint' ? (
        <HintEditor
          content_array={content_array}
          setContentArray={setContentArray}
          submit={podcast_submit}
          version={podcast_submit.version || 1}
        />
      ) : podcast_submit.version >= 2 ? (
        <HintEditor
          content_array={content_array}
          setContentArray={setContentArray}
          submit={podcast_submit}
          version={podcast_submit.version}
        />
      ) : (
        <ReactQuillNoSSR
          theme="snow"
          modules={modules}
          formats={formats}
          className=" w-full"
          value={content}
          onChange={setContent}
        />
      )}
    </div>
  );
}
