import React from 'react';

import { PostCastSubmitType } from '@/core/Constants';
import { RawPodcast } from '@/store/types';

import './ProgressBar.css';

export function ProgressBar({ data }: { data: RawPodcast }) {
  const percent = `${(Number(data?.podcast_submit?.current_result?.percent) * 100).toFixed(0)}%`;

  const color =
    data?.podcast_submit?.status === PostCastSubmitType.SUBMITTED
      ? '#dc2626'
      : '#65a30d';

  const backgroundStyle = `radial-gradient(closest-side, white 79%, transparent 80% 100%), conic-gradient(${color} ${percent}, #e5e7eb 0)`;

  return (
    data.podcast_submit && (
      <div
        title={percent}
        className="circular-progress-bar"
        data-percentage={percent}
        data-color={color}
        style={{ background: backgroundStyle, color }}
      >
        {percent}
      </div>
    )
  );
}
