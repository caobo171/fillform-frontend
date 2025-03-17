import Constants from '@/core/Constants';
import { AnyObject } from '@/store/interface';
import { RawUserPlaylist } from '@/store/types';

export function getPlaylistThumb(data: RawUserPlaylist) {
  if (data?.podcasts[0] && data.podcasts[0].image_url) {
    return `${Constants.IMAGE_URL}${data?.podcasts[0]?.image_url}`;
  }

  return '/static/landing_page2.png';
}

export function parsePlaylistDetailResponse(res: AnyObject): RawUserPlaylist {
  return {
    id: res?.id ?? 0,
    name: res?.name ?? '',
    podcasts: Array.isArray(res?.podcasts) ? res.podcasts : [],
    since: res?.since ?? 0,
    user_id: res?.user_id ?? 0,
    last_update: res?.last_update ?? 0,
  };
}
