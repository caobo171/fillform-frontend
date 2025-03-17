import React from 'react';

export function PlaylistSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-start">
        <div className="flex-auto">
          <p className="h-[24px] w-[100px] animate-pulse rounded bg-gray-200 mb-2" />
          <p className="h-[20px] w-[300px] animate-pulse rounded bg-gray-200" />
        </div>
      </div>

      <div className="flex flex-wrap gap-8">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="w-[178px] h-[178px] rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
