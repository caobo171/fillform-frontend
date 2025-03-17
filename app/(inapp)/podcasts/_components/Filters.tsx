import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { Button, Popover, Select } from '@/components/common';
import { ORDERS } from '@/core/Constants';
import { useCollections } from '@/hooks/collection';
import { useSources } from '@/hooks/source';
import { useQueryString } from '@/hooks/useQueryString';

const LengthOptions = [
  {
    label: 'Siêu ngắn',
    value: '*-50',
  },
  {
    label: 'Ngắn',
    value: '51-200',
  },
  {
    label: 'Vừa',
    value: '201-400',
  },
  {
    label: 'Dài',
    value: '401-*',
  },
];

type Option = {
  label: string;
  value: string;
};

type FilterBaseProps = {
  label: string;
  paramKey: string;
  options?: Option[];
  popupClassName?: string;
};

export function FilterBase({
  label,
  paramKey,
  options,
  popupClassName,
}: FilterBaseProps) {
  const { createMultipleQueryString } = useQueryString();

  const searchParams = useSearchParams();

  const router = useRouter();

  const paramValue = searchParams.get(paramKey);

  const valueArray = useMemo(
    () => (paramValue ? paramValue.split('_') : []),
    [paramValue]
  );

  const isActive = valueArray.length > 0;

  const applyFilter = useCallback(
    (value: string) => {
      let newValues: string[] = [];

      // remove value out of params if it already exists
      if (valueArray.includes(value)) {
        newValues = valueArray.filter((item) => item !== value);
      } else {
        // add value to params
        newValues = [...valueArray, value];
      }

      const newQueryString = createMultipleQueryString({
        [paramKey]: newValues.join('_'),
        page: '1',
      });

      router.push(`/podcasts?${newQueryString}`);
    },
    [createMultipleQueryString, paramKey, router, valueArray]
  );

  const removeFilter = useCallback(() => {
    const newQueryString = createMultipleQueryString({
      [paramKey]: '',
      page: '1',
    });

    router.push(`/podcasts?${newQueryString}`);
  }, [createMultipleQueryString, paramKey, router]);

  const button = (
    <Button
      type={isActive ? 'outline' : 'secondary'}
      rounded
      className={clsx({ 'font-normal text-gray-600': !isActive })}
    >
      {isActive ? `${label} (${valueArray.length})` : label}
      <ChevronDownIcon className="w-5 h-5" />
    </Button>
  );

  return (
    <Popover
      button={button}
      popupClassName={twMerge(
        'left-1/2 -translate-x-1/2 mt-3 w-[360px]',
        popupClassName
      )}
    >
      <div className="flex flex-col gap-4 items-start">
        <div className="flex gap-3 flex-wrap">
          {options?.map((item) => (
            <Button
              key={item.value}
              type={valueArray.includes(item.value) ? 'outline' : 'secondary'}
              onClick={() => applyFilter(item.value)}
            >
              {item.label}
            </Button>
          ))}
        </div>

        {isActive && (
          <span
            aria-hidden="true"
            onClick={removeFilter}
            className="text-sm text-primary underline hover:text-primary-dark cursor-pointer"
          >
            Bỏ chọn tất cả
          </span>
        )}
      </div>
    </Popover>
  );
}

export function Filters() {
  const { data: sourceData } = useSources();

  const { data: collectionData } = useCollections();

  const { createQueryString } = useQueryString();

  const router = useRouter();

  const searchParams = useSearchParams();

  const currentOrder = searchParams.get('order') ?? 'newest';

  const SourceOptions = useMemo(() => {
    if (!Array.isArray(sourceData?.sources)) {
      return [];
    }

    return sourceData.sources.map((source) => ({
      label: source.name,
      value: String(source.id),
    }));
  }, [sourceData?.sources]);

  const CollectionOptions = useMemo(() => {
    if (!Array.isArray(collectionData?.collections)) {
      return [];
    }

    return collectionData.collections.map((source) => ({
      label: source.name,
      value: String(source.id),
    }));
  }, [collectionData?.collections]);

  const handleOrderByChange = useCallback(
    (value: string | number | boolean) => {
      const newQueryString = createQueryString('order', String(value));

      router.push(`/podcasts?${newQueryString}`);
    },
    [createQueryString, router]
  );

  return (
    <div className="flex items-center justify-between">
      {/* Filter */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Bộ lọc</span>

        <FilterBase
          label="Thể loại"
          options={CollectionOptions}
          paramKey="collection_ids"
        />

        <FilterBase
          label="Nguồn"
          options={SourceOptions}
          popupClassName="w-[600px]"
          paramKey="source_keys"
        />

        <FilterBase label="Độ dài" options={LengthOptions} paramKey="length" />
      </div>

      {/* Order by */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">Sắp xếp</span>
        <Select
          options={ORDERS}
          labelClassName="rounded-full"
          value={currentOrder}
          popupClassName="w-[150px]"
          onChange={handleOrderByChange}
        />
      </div>
    </div>
  );
}
