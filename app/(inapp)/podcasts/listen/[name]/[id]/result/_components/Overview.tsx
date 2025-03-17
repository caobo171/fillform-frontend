'use client';

import { usePlayerContext } from '@/app/(inapp)/podcasts/_components/PlayerContext';
import { usePlayerShortcut } from '@/app/(inapp)/podcasts/listen/[name]/[id]/usePlayerShortcut';

export function ResultOverview() {
  const { podcast_submit } = usePlayerContext();

  usePlayerShortcut();

  const accuracy =
    Number(Number(podcast_submit.compare_result.percent).toFixed(2)) * 100;

  const point = (podcast_submit?.point ?? 0).toFixed(2);

  return (
    <div className="w-full flex flex-col items-center justify-center gap-2 bg-white rounded-lg px-6 py-4">
      <div className="w-full flex justify-between">
        <div>
          <p className="font-semibold text-3xl text-yellow-400">{point}</p>
          <p className="text-sm text-gray-500">Điểm</p>
        </div>

        <div className="flex flex-col justify-end items-end">
          <p className="font-semibold text-3xl text-green-500">{accuracy}%</p>
          <p className="text-sm text-gray-500">Độ chính xác</p>
        </div>
      </div>

      <div className="w-full relative">
        <div className="overflow-hidden h-3 flex rounded-full bg-green-100">
          <div
            style={{
              width: `${accuracy}%`,
            }}
            className="h-full rounded-full bg-green-500"
          />
        </div>
      </div>
    </div>
  );
}
