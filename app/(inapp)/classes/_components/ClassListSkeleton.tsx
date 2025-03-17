import React from 'react';

export function ClassListSkeleton() {
  return (
    <div className="flex flex-col pb-4">
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <div className="w-[100px] h-[24px] rounded bg-gray-200 animate-pulse" />
          <p className="mt-2 w-[300px] h-[20px] rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none" />
      </div>

      <div className="flex flex-wrap gap-8 mb-12">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={`class_${item}`}
            className="rounded-lg h-[300px] w-[calc(25%-(32px*3/4))] bg-gray-200 animate-pulse"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <div className="h-[24px] w-[100px] rounded bg-gray-200 animate-pulse" />

        <div className="w-full h-[200px] rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
