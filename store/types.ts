import { TranscriberData } from '@/hooks/transcriber/useTranscriber';
import { AnyObject } from '@/store/interface';

import rootReducer from './rootReducer';

export type RootState = ReturnType<typeof rootReducer>;

declare module 'react-redux' {
  export type EqualityFnType<TSelected> = (
    left: TSelected,
    right: TSelected
  ) => boolean;

  // export function useSelector<TSelected>(
  //   selector: (state: RootState) => TSelected,
  //   equalityFn?: EqualityFnType<TSelected>
  // ): TSelected;
}

export type UploadImage = {
  name: string;
  src: string;
  file: File;
};

export type Param = {
  key: string;
  value: number | string;
};

export type RawNotification = {
  id: number;
  user_id: number;
  user_name: string;
  metatype: string;
  object_id: number;
  object_type: string;
  since: number;
  image: string;
  content: string;
  from_avatar: RawImage;
  from_name: string;
  from_id: number;
  status: number;
  action: string;
  link: string;
};

export type RawWeleClass = {
  id: number;
  members: {
    user_id: number;
  }[];
  user_id: number;
  name: string;
  owner_id: number;
  image_url: string;
  content: string;
  metatype: string;
  since: number;
  last_update: number;
  user?: RawUser;
  owner?: RawUser;
  release_members?: RawUser[];
  stats?: {
    listen_time: number;
    avg_accuracy: number;
    unique_correct_words_num: number;
    score: number;
    submits_num: number;
  };
  assignment_num?: number;
  data?: {
    token?: string;
    settings: {
      show_expired_podcasts: number;
    };
  };
  is_public?: boolean;
  lost_coin?: number;
  assignments_ids?: number[];
};

export type RawUser = {
  id: number;
  username: string;
  fullname: string;
  facebook: string;
  trial_ended: string;
  dayOfBirth: number;
  email: string;
  avatar: string;
  address: string;
  cover_avatar: string;
  sex: string;
  description: string;
  status: number;
  phone: string;
  since: number;
  last_update: number;
  role: number;
  user_type: number[];
  data?: {
    last_login: number;
    challenge_ids: number[];
    coin_fields: { [key: string]: boolean };
    listening_time: number;
    podcasts?: {
      podcast_id: number;
      is_allow_listen_result?: boolean;
    }[];
  };
  total_score?: number;
  score?: number;
  city: string;
  district: string;
  ward: string;
  dob: number;
  allowance_coin: number;
  earning_coin: number;
  job_position: string | null;
  major: string | null;
  school: string | null;
  company: string | null;
  cache_streak: {
    streak_number: number;
    updated_time: number;
  };
  is_super_admin?: boolean;
};

export type RawUserClass = RawUser & {
  following?: {
    podcasts: RawPodcast[];
    following_id: number;
    stats: {
      listen_time: number;
      avg_accuracy: number;
      unique_correct_words_num: number;
      score: number;
      submits_num: number;
    };
  };
};

export type RawImage = {
  id: number;
  link: string;
  name: string;
};

export type RawComment = {
  user_id: number;
  id: number;
  user_name: string;
  user_avatar: string;
  last_update: number;
  metatype: string;
  object_id: string;
  object_export: string;
  object_type: string;
  content: string;
  since: number;
};

export type RawLoginSession = {
  ip: string;
  id: number;
  start_time: number;
};

export type RawBillboard = {
  id: number;
  metatype: string;
  user_id: number;
  score: number;
  since: number;
  last_update: number;
};

export type RawRecord = {
  score: number;
  podcast: number;
  time: number;
};

export type RawDownloadLink = {
  name: string;
  link: string;
};

export type RawPodcast = {
  id: number;
  name: string;
  sub_name: string;
  views: number;
  metatype: string;
  user_id: number;
  download_link: RawDownloadLink[];
  data: string;
  duration: number;
  image_url: string;
  hint: number[];
  narrator: string;
  source_key: number;
  description: string;
  since: number;
  last_update: number;
  file_size: number;
  file_path: string;
  result: string;
  collections: string[];
  member_count: number;
  status: number;
  class_id: number;
  private: number;
  has_transcript: number;

  version: number;
  result_array: string[];

  podcast_submit?: RawPodcastSubmit;
  transcript?: TranscriberData['chunks'];

  // Fetch property
  is_submitted?: number;
  is_listening?: number;

  members: {
    score: number;
    user_id: number;
    percent?: number;
  }[];
};

export type RawPodcastSubmit = {
  id: number;
  metatype: string;
  user_id: number;
  content: string;
  data: string;
  status: number;
  draft: string;
  podcast_id: number;
  podcast_name: string;
  podcast_result: string;
  podcast_hints: number[];
  since: number;
  submit_time: number;
  last_update: number;
  user_name: string;
  user_avatar: string;
  podcast_subname: string;
  version: number;
  current_time_listen: number;
  draft_array: string[];
  result_array: {
    [key: number]: string;
  };
  can_resubmit: number;
  point?: number;
  current_result: {
    percent: number;
  };
  compare_result: {
    diffs: AnyObject[];
    unique_correct_words_num: number;
    phrase_index: {
      [key: string]: { l: number; r: number }[];
    };
    miss_phrases: {
      [key: string]: number;
    };
    residual_phrases: {
      [key: string]: number;
    };
    wrong_phrases: {
      [keys: string]: string[] | { user_word: string; index: number }[];
    };
    percent: number;
  };
};

export type RawPodcastTranscription = {
  id: number;
  podcast_id: number;
  transcriptions: PodcastTranscriptionWord[];
  transcription_sentences: PodcastTranscriptionSentence[];
  origin_transcriptions: PodcastTranscriptionWord[];
  origin_transcription_sentences: PodcastTranscriptionSentence[];
};

export type PodcastTranscriptionWord = {
  id: string;
  s: number;
  e: number;
  w: string;
  sid: string;
};

export type PodcastTranscriptionSentence = {
  id: string;
  content: string;
};

export type RawPodcastCollection = {
  id: number;
  description: string;
  data: string;
  name: string;
  since: number;
  last_update: number;
  views: number;
  position: number;
};

export type RawPodcastSource = {
  id: number;
  description: string;
  website: string;
  data: string;
  name: string;
  since: number;
  last_update: number;
  views: number;
  position: number;
};

export type RawUserActionLog = {
  id: number;
  user_id: number;
  podcast_id: string;
  status: number;
  data: string;
  content: string;
  podcast_image: string;
  podcast_name: string;
  podcast_sub_name: string;
  metatype: string;
  action: number;
  start_time: number;
  end_time: number;
  user_name: string;
  user_avatar: string;
  likes: number;
  like_logs: number[];
  is_public: number;
  allow_comment: boolean;
  comment_count: number;
  comments: RawComment[];
};

export type RawCacheSubmit = {
  value: number;
  listen_time: number;
  podcast_id: number;
  podcast_name: string;
  podcast_subname: string;
  record_time: number;
  submit_time: number;
  compare_result: {
    unique_correct_words_num: number;
    miss_phrases: {
      [key: string]: number;
    };
    residual_phrases: {
      [key: string]: number;
    };
    wrong_phrases: {
      [keys: string]: string[] | { user_word: string; index: number }[];
    };
    percent: number;
  };
};

export type RawPersonalRecord = {
  id: string;
  user_id: number;
  username: string;
  following_users: string;
  metatype: string;
  submitted_podcasts: number;
  in_progress_podcasts: number;
  cache_vocabs: {
    [key: string]: number | null;
  };
  cache_frequency_vocabs: {
    [key: string]: string;
  };
  cache_submits: {
    [key: number]: RawCacheSubmit;
  };
  podcast_submit_logs: {
    submit_time: number;
    total_vocabs: string[];
    added_vocabs: string[];
  }[];
  time_listen?: {
    listen_time: number;
    podcast_id: number;
    podcast_name: string;
    podcast_subname: string;
    record_time: number;
  }[];
};

export type RawVocabItem = {
  correct_word: string;
  wrong_words: string[];
  freq: number;
  record_time: number;
};

export type RawTimeListenItem = {
  record_time: number;
  listen_time: number;
  podcast_id: number;
  podcast_name: string;
  podcast_subname: string;
};

export type RawPointsItem = {
  record_time: number;
  podcast_id: number;
  podcast_name: string;
  podcast_subname: string;
  value: number;
  accuracy: number;
};

export type RawWordsItem = {
  record_time: number;
  podcast_id: number;
  podcast_name: string;
  podcast_subname: string;
  total_words: number;
  wrong_words: number;
  current_listened_words: number;
};

export type ReportWordType = {
  label: string;
  freq: number;
  references?: ReferenceWrongWord[];
  statsFreq?: string;
};

export type ReferenceWrongWord = {
  user_word: string;
  index: number;
  podcast_id: number;
  user_id?: number;
};

export type RawSystemNotification = {
  id: number;
  notification_ids: number[];
  metatype: string;
  is_private: boolean;
  since: number;
  receivers: number[];
  title: string;
  image: string;
  last_update: number;
  link: string;
  content: string;
  data: string;
  publish_time: number;
  user_id: number;
};

export type RawCertification = {
  id: number;
  metatype: string;
  since: number;
  last_update: number;
  image: string;
  for_user_id: number;
  for_user_name: string;
  for_user_avatar: string;
  content: string;
  user_id: number;
  user_avatar: string;
  user_name: string;
  certification_type: number;
  user_action_log_id: number;
  data: string;
};

export type RawBadge = {
  id: number;
  metatype: string;
  since: number;
  last_update: number;
  value: string;
  data: string;
  badge_name: string;
};

export type RawChallenge = {
  id: number;
  metatype: string;
  name: string;
  user_id: number;
  data: AnyObject;
  description: string;
  background_image: string;
  start_time: number;
  end_time: number;
  since: number;
  last_update: number;
  status: string;
  podcast_ids: number[];
  challenge_type: {
    team: {
      status: boolean;
      number_member: number;
    };
    limit_time: {
      status: boolean;
      value: number;
    };
    limit_podcast: {
      status: boolean;
      podcasts: {
        id: number;
        point: number;
      }[];
    };
  };
  active?: boolean;
  lost_coin: number;
  reward_coin: number;
};

export type RawRecordChallengeUser = {
  id: number;
  metatype: string;
  user_id: number;
  challenge_id: number;
  data: string;
  since: number;
  last_update: number;
  status: number;
  point: number;
  team_id: number;
  time_listen: number;
  rank_record: {
    last_update: number;
    rank: number;
    status: number;
  };
};

export type RawPodcastChallenge = {
  id: number;
  user_id: number;
  podcast_id: number;
  challenge_id: number;
  record_challenge_user_id: number;
  metatype: string;
  data: AnyObject;
  draft_array: string;
  point: number;
  time_listen: number;
  last_update: number;
  draft: string;
  status: number;
  compare_result: string;
  results: string;
  current_time_listen: number;
  is_submitted: number;
  submit_time: number;
  rank_record: {
    last_update: number;
    rank: number;
    status: number;
  };
};

export type RawUserPlaylist = {
  id: number;
  name: string;
  podcasts: RawPodcast[];
  since: number;
  last_update: number;
  user_id: number;
  user_name?: string;
  description?: string;
  privacy?: number;
};

export type RawTeamChallenge = {
  id: number;
  name: string;
  avatar: string;
  metatype: string;
  description: string;
  user_id: number;
  challenge_id: number;
  data: string;
  create_at: number;
  last_update: number;
  status: number;
  user_ids: number[];
  hash_key: string;
  point: number;
  time_listen: number;
  user_invited_ids: number[];
  user_requested_ids: number[];
  admin_ids: number[];
  rank_record: {
    last_update: number;
    rank: number;
    status: number;
  };
};

export type RawOrderSubscription = {
  id: number;
  name: string;
  plan: string;
  period: string;
  price: number;
  user_id: number;
  status: number;
  last_update: number;
  since: number;
  coupon_code: string;
  image_url: string;
  subscription_id: number;
};

export type RawSubscription = {
  id: number;
  name: string;
  plan: string;
  period: string;
  price: number;
  user_id: number;
  start_date: number;
  end_date: number;
  last_update: number;
  since: number;
  status: number;
  order_id: number;
  is_effective: number;
  forever: number;
  linked_lemonsequeezy_object?: AnyObject;
  is_freetrial: number;
  is_premium_member: number;
  is_paid_premium: number;
};

export type RawAssignment = {
  id: number;
  class_id: number;
  class_name?: string;
  content: string;
  name: string;
  start_time: number;
  end_time: number;
  podcasts: { podcast_id: number }[];
  members: { user_id: number }[];
  user_id: number;
  status: number;
  release_members: RawUser[];
  release_podcasts: RawPodcast[];
};

export type RawUserStats = {
  user: RawUser;
  record: RawPersonalRecord | null;
  podcast_submits?: RawPodcastSubmit[];
  billboard?: RawBillboard | null;
  num_in_progress?: number;
  num_submits?: number;
  num_done_submits?: number;
  badges?: RawBadge[];
  code?: number;
  listened_words?: number;
  latest_active_time?: number;
  num_action_logs?: number;
  current_order?: number;
  billboard_count?: number;
  general?: {
    listened_words: number;
    latest_active_time: number;
    cache_submits: AnyObject;
  };
};

export type ProfileProps = {
  record: (RawPersonalRecord & RawWeleClass) | null;
  user: RawUser;
  podcast_submits: RawPodcastSubmit[];
  podcasts: RawPodcast[];
  weleclass?: RawWeleClass;
  general?: {
    latest_active_time?: number;
    listened_words?: number;
  };
};

export type PageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export type ExtraPageProps = {
  routerGroup?: string;
  apiGroup?: string;
};

export type RawFeedback = {
  id: number;
  receiver_id: number;
  receiver_name: string;
  receiver_gmail: string;
  reviewer_id: number;
  reviewer_name: string;
  reviewer_gmail: string;
  content: string;
  object_id: number;
  object_type: string;
  create_at: number;
  update_at: number;
};

export type RawPagination = {
  page: number;
  page_size: number;
  total: number;
};

export type WordReview = {
  id: number;
  user_id: number;
  word: string;

  status: number;
  review_stats: string;

  real_wrong_stats: {
    [podcast_id: string | number]: [
      {
        index: number;
        user_word: string;
        submit_id: number;
      },
    ];
  };
  since: number;
  last_update: number;
};

export type WordReviewListeningExercise = {
  type: 'listening';
  status?: number;
  id: string;
  submit_data?: any;
  data: {
    word: string;
    word_index: number;
    submit_id: number;
    user_word: string;
    podcast_id: number;
  };
};
