import React from 'react';

export function UserInfoSkeleton() {
  return (
    <div className="rounded-lg bg-white p-6 flex flex-col items-center">
      <div className="w-[100px] h-[100px] rounded-full mb-4 bg-gray-100 animate-pulse" />

      <div className="flex flex-col gap-0.5 items-center mb-4">
        <p className="h-7 w-[150px] rounded bg-gray-100 animate-pulse" />
      </div>

      <p className="h-5 w-[120px] rounded bg-gray-100 animate-pulse mb-4" />

      <div className="flex gap-4 mb-6 w-[64px] h-6 rounded bg-gray-100 animate-pulse" />

      <p className="h-5 w-full bg-gray-100 rounded animate-pulse" />
    </div>
  );
}

export function OverallSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-6">
        {/* Left column */}
        <div className="rounded-lg bg-white flex gap-6 p-6 w-2/3">
          <div className="flex flex-col justify-between">
            <div className="flex items-end gap-6 mb-10">
              <span className="h-[60px] w-[80px] rounded-lg bg-gray-100 animate-pulse" />

              <span className="h-7 w-[88px] rounded-lg bg-gray-100 animate-pulse" />
            </div>

            <p className="h-5 w-[288px] rounded bg-gray-100 animate-pulse" />
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4 w-1/3">
          <div className="flex gap-6 p-4 rounded-lg bg-white text-gray-500">
            <div className="w-14 h-14 rounded-lg bg-gray-100 animate-pulse flex items-center justify-center" />

            <div className="flex flex-col justify-between">
              <span className="h-8 w-[100px] rounded bg-gray-100 animate-pulse" />
              <span className="h-5 w-[100px] rounded bg-gray-100 animate-pulse" />
            </div>
          </div>

          <div className="flex gap-6 p-4 rounded-lg bg-white text-purple-500">
            <div className="w-14 h-14 rounded-lg bg-gray-100 animate-pulse flex items-center justify-center" />

            <div className="flex flex-col justify-between">
              <span className="h-8 w-[100px] rounded bg-gray-100 animate-pulse" />
              <span className="h-5 w-[100px] rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex gap-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="flex items-start gap-2 rounded-lg bg-white py-3 px-4"
            style={{ width: 'calc(25% - 12px)' }}
          >
            <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />

            <div className="flex flex-col gap-1">
              <span className="h-7 w-10 rounded bg-gray-100 animate-pulse" />
              <span className="h-5 w-[80px] rounded bg-gray-100 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListeningListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg bg-white p-6">
        <div className="mx-[-8px] flex flex-col gap-6">
          {[1, 2, 3].map((podcast) => (
            <div
              key={podcast}
              className="w-full h-[112px] rounded-lg bg-gray-100 animate-pulse"
            />
          ))}

          <div className="w-full h-9 rounded-md bg-gray-100 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export function PerformanceSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-end text-sm text-gray-900">
        <span className="w-[100px] h-5 rounded bg-gray-150 animate-pulse" />
        <div className="w-[200px] h-5 rounded bg-gray-150 animate-pulse" />
      </div>

      <div className="flex flex-col gap-10 rounded-lg bg-white p-6">
        <div className="flex flex-wrap gap-x-8 gap-y-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-[88px] rounded-lg bg-gray-100 animate-pulse"
              style={{ width: 'calc(50% - 16px)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
