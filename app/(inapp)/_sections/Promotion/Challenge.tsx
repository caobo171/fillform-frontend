'use client';

import { UsersIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { TimeStatus } from '@/app/(inapp)/challenges/_components/TimeStatus';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { useImageColor } from '@/app/(inapp)/home/_sections/Promotion/imageHook';
import { Button } from '@/components/common';
import Constants from '@/core/Constants';
import { Challenge as ChallengeModule } from '@/modules/challenge/challenge';

export function Challenge({ challenge }: { challenge: RawChallenge }) {
  const { luma, rgb } = useImageColor(
    challenge.image_url,
    String(challenge.id)
  );

  const buttonColor = useMemo(
    () => (luma > 0.4 ? `rgba(${rgb.join(', ')}, 1)` : 'white'),
    [luma, rgb]
  );

  const buttonBg = useMemo(
    () =>
      `hsl(from rgba(${rgb.join(', ')}, 1) h s calc(l ${luma > 0.4 ? '+ 100' : '- 10'}))`,
    [luma, rgb]
  );

  if (!challenge) {
    return null;
  }

  return (
    <div
      className="relative w-full h-[400px] rounded-lg bg-cover bg-center overflow-hidden"
      style={{
        backgroundImage: `url(${Constants.IMAGE_URL}${challenge.image_url})`,
      }}
    >
      <div
        className="absolute z-1 w-full h-full top-0 left-0"
        style={{
          background: `linear-gradient(to right, rgba(${rgb.join(', ')}, ${luma > 0.45 ? '1' : '0.8'}) 0px, rgba(${rgb.join(', ')}, ${luma > 0.45 ? '1' : '0.8'}) 400px, transparent 800px)`,
        }}
      />

      <div className="p-10 relative z-2 w-[560px] h-full flex flex-col items-start justify-center">
        <div className="flex-1">
          <h3
            className={twMerge(
              'text-4xl font-medium mb-4',
              luma > 0.65 ? 'text-gray-900' : 'text-white'
            )}
          >
            {challenge.name}
          </h3>

          <p
            className={twMerge(
              'text-base line-clamp-5 mb-6',
              luma > 0.65 ? 'text-gray-700' : 'text-gray-200'
            )}
            dangerouslySetInnerHTML={{ __html: challenge.description ?? '' }}
          />

          <div
            className={twMerge(
              'flex items-center gap-6 text-base mb-[56px]',
              luma > 0.65 ? '!text-gray-700' : '!text-gray-200'
            )}
          >
            <span>{challenge?.podcasts_data?.length ?? 0} podcasts</span>

            <span className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />{' '}
              {challenge?.members_data?.length ?? 0} người tham gia
            </span>

            <span className="flex items-center gap-2">
              <TimeStatus
                data={challenge}
                className={twMerge(
                  '*:text-base',
                  luma > 0.65 ? '*:text-gray-700' : '*:text-gray-200'
                )}
              />
            </span>
          </div>
        </div>

        <Link href={ChallengeModule.getURL(challenge)}>
          <Button
            size="large"
            className="hover:opacity-90"
            style={{
              color: buttonColor,
              backgroundColor: buttonBg,
            }}
          >
            Tìm hiểu thêm
          </Button>
        </Link>
      </div>
    </div>
  );
}
