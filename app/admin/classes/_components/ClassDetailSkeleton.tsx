import React from 'react';

export function ClassDetailSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <div className="w-[100px] h-[24px] rounded bg-gray-200 animate-pulse" />
          <p className="mt-2 w-[300px] h-[20px] rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none" />
      </div>

      <div className="w-full h-[152px] rounded-lg bg-gray-200 animate-pulse" />

      <div className="flex gap-8">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={`general_${item}`}
            className="w-1/4 h-[88px] rounded-lg bg-gray-200 animate-pulse"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-[24px] w-[100px] rounded bg-gray-200 animate-pulse" />

        <div className="w-full h-[200px] rounded-lg bg-gray-200 animate-pulse" />
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-[24px] w-[100px] rounded bg-gray-200 animate-pulse" />

        <div className="w-full h-[300px] rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
