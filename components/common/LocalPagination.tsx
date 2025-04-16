import {
  ArrowLongLeftIcon,
  ArrowLongRightIcon,
} from '@heroicons/react/20/solid';
import clsx from 'clsx';
import React from 'react';

import { DOTS, usePagination } from '@/hooks/usePagination';

type PaginationProps = {
  total: number;
  current: number;
  sibling?: number;
  pageSize: number;
  onChange?: (value: number) => void;
  className?: string;
};

export function LocalPagination(props: PaginationProps) {
  const { onChange, total, sibling = 1, current, pageSize, className } = props;

  const paginationRange = usePagination({
    currentPage: current,
    totalCount: total,
    siblingCount: sibling,
    pageSize,
  });

  if (current === 0 || !paginationRange || paginationRange.length < 2) {
    return null;
  }

  const onNext = () => {
    if (onChange) {
      onChange(current + 1);
    }
  };

  const onPrevious = () => {
    if (onChange) {
      onChange(current - 1);
    }
  };

  const lastPage = paginationRange[paginationRange.length - 1];

  return (
    <nav
      className={clsx(
        'flex items-center justify-between px-4 sm:px-0 select-none',
        className
      )}
    >
      <div className="-mt-px flex w-0 flex-1">
        <span
          aria-hidden="true"
          className={clsx(
            'inline-flex items-center pr-1 pt-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700',
            {
              'pointer-events-none': current === 1,
            }
          )}
          onClick={onPrevious}
        >
          <ArrowLongLeftIcon
            className="mr-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
          Previous
        </span>
      </div>

      {paginationRange.map((pageNumber, index) => {
        if (pageNumber === DOTS) {
          return (
            <span
              key={`pagination-${index}`}
              className="inline-flex items-center px-4 pt-4 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              &#8230;
            </span>
          );
        }

        return (
          <span
            key={`pagination-${index}`}
            aria-hidden="true"
            className={clsx(
              'inline-flex items-center px-4 pt-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700',
              {
                'text-primary': pageNumber === current,
              }
            )}
            onClick={() => onChange && onChange(Number(pageNumber))}
          >
            {pageNumber}
          </span>
        );
      })}

      <div className="-mt-px flex w-0 flex-1 justify-end">
        <span
          aria-hidden="true"
          className={clsx(
            'inline-flex items-center pl-1 pt-4 text-sm font-medium text-gray-500 cursor-pointer hover:text-gray-700',
            {
              'pointer-events-none': current === lastPage,
            }
          )}
          onClick={onNext}
        >
          Next
          <ArrowLongRightIcon
            className="ml-3 h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        </span>
      </div>
    </nav>
  );
}
