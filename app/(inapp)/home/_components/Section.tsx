import Link from 'next/link';
import React from 'react';
import { twMerge } from 'tailwind-merge';

type SectionProps = {
  title?: string;
  seeMoreLink?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
  seeMoreClassName?: string;
};

export function Section(props: SectionProps) {
  const {
    title,
    seeMoreLink,
    className,
    titleClassName,
    seeMoreClassName,
    children,
  } = props;

  return (
    <div className={twMerge('flex flex-col gap-4', className)}>
      <div className="flex justify-between items-end">
        <h3
          className={twMerge(
            'text-xl text-gray-900 font-semibold',
            titleClassName
          )}
        >
          {title}
        </h3>

        {seeMoreLink && (
          <Link
            href={seeMoreLink}
            className={twMerge(
              'text-gray-500 text-sm hover:text-gray-700',
              seeMoreClassName
            )}
          >
            Xem thêm
          </Link>
        )}
      </div>

      {children}
    </div>
  );
}
