'use client';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ReactHtmlParser from 'react-html-parser';

import { RawPodcast } from '@/store/types';

export function DisplayDesc({ podcast }: { podcast: RawPodcast }) {
  return (
    <div className="mt-8 text-base text-gray-700">
      {ReactHtmlParser(
        `
            <style>
                .podcast-desc p {
                    margin-bottom: 1rem;
                }
            </style>
            <div class='podcast-desc'>${podcast.description}</div>
           `
      )}
    </div>
  );
}
