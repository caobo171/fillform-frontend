export function Skeleton() {
  return (
    <div className="flex-1 flex flex-col gap-[48px]">
      <div className="flex gap-6">
        <div className="w-[224px] h-[224px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex-1 flex flex-col justify-between text-gray-900 text-sm">
          <div className="flex-1">
            <p className="mb-2 h-[32px] w-[200px] rounded bg-gray-200 animate-pulse" />

            <p className="mb-6 h-[20px] w-[300px] rounded bg-gray-200 animate-pulse" />

            <div className="mb-2 h-[20px] w-[300px] rounded bg-gray-200 animate-pulse" />
          </div>

          <div className="mb-[2px] w-[300px] h-[40px] rounded bg-gray-200 animate-pulse" />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="w-full h-[48px] rounded-lg bg-gray-200 animate-pulse" />
        <div className="w-full h-[48px] rounded-lg bg-gray-200 animate-pulse" />
      </div>
    </div>
  );
}
