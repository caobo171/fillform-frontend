import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { Helper } from '@/services/Helper';

export class Challenge {
  static getURL = (challenge: RawChallenge) =>
    `/challenges/detail/${Helper.generateCode(challenge.name)}/${challenge.id}`;
}
