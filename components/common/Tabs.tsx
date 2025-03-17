import clsx from 'clsx';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Badge } from '@/components/common/Badge';
import { PremiumIcon } from '@/components/common/PremiumIcon';

type TabProps = {
  active?: boolean;
  number?: number;
  label: string;
  value: string;
  onClick?: (key: string) => void;
  link?: string;
  isPremium?: boolean;
};

function Tab({
  active,
  number,
  label,
  value,
  onClick,
  link,
  isPremium,
}: TabProps) {
  const classNames = twMerge(
    'flex items-center gap-2 py-2 border-b-2 text-gray-600 border-b-transparent cursor-pointer',
    clsx({
      'text-primary border-primary': active,
    })
  );

  const content = (
    <>
      <span className="text-sm font-medium">{label}</span>
      {number && (
        <Badge
          className="py-0.5 font-medium"
          type={number > 0 ? 'primary' : 'gray'}
        >
          {number}
        </Badge>
      )}
      {isPremium && <PremiumIcon />}
    </>
  );

  if (link) {
    return (
      <Link href={link} className={classNames} aria-hidden="true">
        {content}
      </Link>
    );
  }

  return (
    <div
      className={classNames}
      aria-hidden="true"
      onClick={() => onClick?.(value)}
    >
      {content}
    </div>
  );
}

export type TabsProps = {
  options: TabProps[];
  defaultActiveKey?: string;
};

export function Tabs({ options, defaultActiveKey }: TabsProps) {
  const [activeKey, setActiveKey] = useState<string | undefined>(
    defaultActiveKey
  );

  useEffect(() => {
    setActiveKey(defaultActiveKey);
  }, [defaultActiveKey]);

  return (
    <div className="flex gap-6">
      {options.map((option) => (
        <Tab
          {...option}
          key={option.value}
          active={activeKey === option.value}
          onClick={setActiveKey}
        />
      ))}
    </div>
  );
}
