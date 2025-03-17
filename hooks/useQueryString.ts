import { useSearchParams } from 'next/navigation';
import { useCallback } from 'react';

type ObjectParam = {
  [key: string]: string;
};

export function useQueryString() {
  const searchParams = useSearchParams();

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);

      return params.toString();
    },
    [searchParams]
  );

  const createMultipleQueryString = useCallback(
    (objectParam: ObjectParam) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(objectParam).forEach(([key, value]) => {
        params.set(key, value);
      });

      return params.toString();
    },
    [searchParams]
  );

  return { createQueryString, createMultipleQueryString };
}
