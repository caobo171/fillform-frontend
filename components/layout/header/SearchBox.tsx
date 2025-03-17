'use client';

import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';

import LogEvent from '@/packages/firebase/LogEvent';

export function SearchBox({ url }: { url: string }) {
  const route = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  const pathname = usePathname();

  const query = searchParams.get('q');

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  useEffect(() => {
    if (query) {
      setSearch(query);
    }
  }, [query]);

  const onSubmit = (e: React.KeyboardEvent<HTMLElement>) => {
    LogEvent.sendEvent('search_item.filter');
    if (e.key === 'Enter') {
      route.push(`${url || pathname}?${createQueryString('q', search)}`);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-gray-150 rounded-full hover:bg-gray-200">
      <label htmlFor={`search${url}`} className="py-2.5 pl-4">
        <MagnifyingGlassIcon className="w-5 h-auto text-gray-500" />
      </label>

      <input
        autoComplete={undefined}
        id={`search${url}`}
        className="focus:outline-none bg-transparent w-full text-sm pr-4 py-2.5"
        type="text"
        placeholder="Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={onSubmit}
      />
    </div>
  );
}
