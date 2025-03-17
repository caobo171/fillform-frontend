import { RawPodcast, RawUser } from '@/store/types';

import { Type } from './challengeConstant';

export type RawChallenge = {
  id: number;
  name: string;
  type: Type;
  description: string | null;
  image_url: string;
  created_at: number;
  created_by: number;
  updated_at: number;
  is_public: boolean;
  lost_coin: number;
  reward_coin: number;
  members_data: {
    user_id: number;
    joined_at: number;
  }[];
  members?: RawUser[];
  podcasts_data: {
    podcast_id: number;
    point: number;
    user_point?: number;
    user_accuracy?: number;
    total_unique_correct_words: number;
    unique_correct_words: number;
    listening_time: number;
  }[];
  podcasts?: RawPodcast[];
  data: {
    start_time?: number;
    end_time?: number;
    time_limit?: number;
  };
  metatype?: string;
  expired_time_by_user?: number;
  is_joined?: number;
};

export type UserChallenge = RawUser & {
  totalPoint?: number;
  numberOfFinishedPodcast?: number;
  averageAccuracy?: number;
  listenedTime?: number;
  joinedChallengeAt?: number;
  listeningTime?: number;
  uniqueCorrectWords?: number;
};

export type UserResult = RawUser & {
  joined_at: number;
  podcasts_data: RawChallenge['podcasts_data'];
};
