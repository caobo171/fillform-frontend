import { Code, FILLER_TEXT } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Helper } from '@/services/Helper';
import { Toast } from '@/services/Toast';
import { RawPodcast, RawPodcastSubmit } from '@/store/types';
import hintHelpers, { HintHelpers, legacySplitWords } from '@/helpers/hint';

export class Podcast {
  static getURL = (podcast: RawPodcast) => {
    return `/podcasts/detail/${Helper.generateCode(podcast.name + '_' + podcast.sub_name)}/${podcast.id}`;
  };

  static getListenURL = (podcast: RawPodcast, type?: string) => {
    if (!type) {
      type = '';
    }
    return `/podcasts/listen/${Helper.generateCode(podcast.name + '_' + podcast.sub_name)}/${podcast.id}?type=${type}`;
  };

  static getResultURL = (podcast: RawPodcast) => {
    return `/podcasts/listen/${Helper.generateCode(podcast.name + '_' + podcast.sub_name)}/${podcast.id}/result`;
  };

  static getResultContent = (
    submit: RawPodcastSubmit,
    content_array: string[]
  ) => {
    // return submit.podcast_result.replace(/\b\w*_\w*\b/g, (match, ...params) => {
    // 	console.log(match, params);
    // 	return match;
    // });
    return legacySplitWords(submit.podcast_result)
      .map((e, index) => {
        const hint_index = submit.podcast_hints.indexOf(index);
        if (hint_index > -1) {
          return content_array[hint_index]
            ? content_array[hint_index]
            : FILLER_TEXT;
        }

        return e;
      })
      .join(' ');
  };

  // GENERATE HINT
  static getContentArray = (submit: RawPodcastSubmit, version: number) => {
    const hints = submit.podcast_hints;

    if (version >= 2) {
      return Object.keys(submit.result_array).map((value) => {
        if (hints.includes(Number(value))) {
          // draft_array is result of user input
          // having draft_array when user update first time
          return submit.draft_array.length > 0
            ? submit.draft_array[Number(value)]
            : FILLER_TEXT;
        }

        return submit.result_array[Number(value)];
      });
    }

    return hints.map((e, index) => {
      if (submit.draft_array[index]) {
        return submit.draft_array[index];
      }

      return FILLER_TEXT;
    });
  };

  static remove = async (podcast: RawPodcast, cb: any) => {

    if (typeof window !== 'undefined') {
      const result = await window.confirm(
        'Are you sure to delete podcast ' + podcast.name + '?'
      );
      if (result) {
        try {
          const res: any = await Fetch.postWithAccessToken<{
            podcast: RawPodcast;
            code: number;
          }>('/api/podcasts/remove', {
            id: podcast.id,
          });

          if (res && res.data) {
            if (res.data.code != Code.SUCCESS) {
              Toast.error(res.data.message);
              return;
            } else {
              Toast.success('Remove Podcast Successful!');
              cb && cb();
              return;
            }
          }
        } catch { }
        Toast.error('Some errors occurred!');
      }
    }
  };
}
