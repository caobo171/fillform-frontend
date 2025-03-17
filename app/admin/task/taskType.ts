import { RawUser } from '@/store/types';

export type RawSocialShare = {
  create_at: number;
  id: number;
  image_url: string | null;
  public_link: string;
  reaction_total: number;
  reward_coin: number;
  update_at: number;
  user_id: number;
  user?: RawUser;
  status: string;
};
