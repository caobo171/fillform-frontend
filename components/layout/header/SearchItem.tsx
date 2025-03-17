'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import LogEvent from '@/packages/firebase/LogEvent';
import React, { useCallback, useState, useEffect } from 'react';

const SearchItem = ({ url, size }: { url: string; size?: number }) => {
  const route = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');

  const pathname = usePathname();

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
    if (searchParams.get('q')) {
      setSearch(searchParams.get('q') as string);
    }
  }, [searchParams.get('q')]);

  const onSubmit = (e: any) => {
    LogEvent.sendEvent('search_item.filter');
    if (e.key == 'Enter') {
      route.push((url || pathname) + '?' + createQueryString('q', search));
    }
  };

  return (
    <input
      autoComplete={undefined}
      id={`search${url}`}
      className="focus:outline-none bg-transparent w-full text-sm"
      type="text"
      placeholder="Search..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      onKeyDown={onSubmit}
    />
  );
};

export default SearchItem;
