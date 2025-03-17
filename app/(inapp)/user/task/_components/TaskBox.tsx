import React from 'react';
import { CircleStackIcon } from '@heroicons/react/24/outline';

interface TaskBoxProps {
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  coin: number;
}

export function TaskBox({ onClick, icon, title, coin }: TaskBoxProps) {
  return (
    <div
      aria-hidden="true"
      onClick={onClick}
      className="rounded-lg p-2 gap-4 bg-white flex items-center w-[calc(33.33%-16px)] cursor-pointer hover:shadow-sm"
    >
      <div className="w-[56px] h-[56px] rounded-lg flex items-center justify-center bg-red-50">
        {icon}
      </div>

      <div className="flex flex-col gap-2 justify-start items-start">
        <h4 className="font-medium text-sm text-gray-900">{title}</h4>

        <div className="flex gap-1 items-center">
          <span className="text-sm text-green-500">+{coin}</span>
          <CircleStackIcon className="w-4 h-4 text-orange-500" />
        </div>
      </div>
    </div>
  );
}
