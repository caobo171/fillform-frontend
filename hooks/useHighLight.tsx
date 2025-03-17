import { pull, union } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const StorageKey = 'clickedHighlight';

export function useHighLight(key: string) {
  const [clickedList, setClickedList] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(StorageKey) ?? '[]');
    } catch (err) {
      return [];
    }
  });

  const [isClicked, setIsClicked] = useState<boolean>(true);

  // add key to clicked list
  const setAsClicked = useCallback(() => {
    const list = union(clickedList, [key]);

    setClickedList(list);

    localStorage.setItem(StorageKey, JSON.stringify(list));
  }, [key, clickedList]);

  // remove key out of clicked list
  const setAsUnClicked = useCallback(() => {
    const list = pull(clickedList, key);

    setClickedList(list);

    localStorage.setItem(StorageKey, JSON.stringify(list));
  }, [key, clickedList]);

  useEffect(() => {
    setIsClicked(clickedList.includes(key));
  }, [key, clickedList]);

  return {
    isClicked,
    setAsClicked,
    setAsUnClicked,
  };
}
