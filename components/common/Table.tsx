import {
  ArrowLongDownIcon,
  ArrowLongUpIcon,
  FolderOpenIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { isEqual, orderBy } from 'lodash';
import { useCallback, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';

import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';

import { Loading } from './Loading';

type ColumnProps<RecordType> = {
  // title of this column
  title: string | React.ReactNode;
  // unique key of this column, you can ignore this prop if you've set a unique dataIndex
  key?: string;
  // display field of the data record
  dataIndex?: string;
  // renderer of the table cell. The return value should be a ReactNode
  render?: (data: RecordType, index: number) => React.ReactNode;
  // the className of this column
  className?: string;
  // unique for each column, this one will be used as a key to memorize sorted column
  sortBy?: string;
  // type of sortIteratee ~ lodash orderBy iteratees param, but in singular value
  // https://lodash.com/docs/4.17.15#orderBy
  sortIteratee?: unknown;
};

export type TableProps<T> = {
  columns: ColumnProps<T>[];
  data: T[];
  className?: string;
  loading?: boolean;
  noDataText?: string;
};

type SortedInfoObject = {
  order: 'asc' | 'desc' | boolean; // following lodash/orderBy
  columnKey: string | null;
};

export function Table<RecordType extends AnyObject>(
  props: TableProps<RecordType>
) {
  const { columns, data, className, loading, noDataText } = props;

  const [backupData, setBackupData] = useState<RecordType[]>(data);

  const [sortedData, setSortedData] = useState<RecordType[]>(data);

  const [sortedInfo, setSortedInfo] = useState<SortedInfoObject>({
    order: false,
    columnKey: null,
  });

  const handleSort = useCallback(
    (key: string, iteratee?: unknown) => {
      if (!key) {
        return;
      }

      let nextOrder: SortedInfoObject['order'] = 'asc';

      const currentOrder = sortedInfo?.order;

      // sort circle: false -> acs -> desc -> false
      if (key === sortedInfo?.columnKey) {
        if (currentOrder === false) {
          nextOrder = 'asc';
        } else if (currentOrder === 'asc') {
          nextOrder = 'desc';
        } else if (currentOrder === 'desc') {
          nextOrder = false;
        }
      }

      // this is kind of custom sort function
      // follow lodash/orderBy definition
      const ite = (() => {
        if (iteratee) {
          return iteratee;
        }

        return (record: RecordType) => {
          if (typeof record[key] === 'string') {
            // remove all Vietnamese accents
            return Helper.removeAccents(record[key]);
          }

          // value can be number here
          return record[key];
        };
      })();

      const sData: RecordType[] = orderBy(
        backupData,
        [ite],
        [nextOrder]
      ) as RecordType[];

      setSortedData(nextOrder ? sData : backupData);

      setSortedInfo({ order: nextOrder, columnKey: key });
    },
    [backupData, sortedInfo]
  );

  useEffect(() => {
    if (!isEqual(data, backupData)) {
      setBackupData(data);

      setSortedData(data);
    }
  }, [data]);

  return (
    <div
      className={twMerge(
        'relative ring-1 ring-black ring-opacity-5 sm:rounded-lg bg-white overflow-x-auto',
        clsx({
          'overflow-hidden min-h-[180px]': data.length === 0,
        }),
        className
      )}
    >
      <table className="min-w-full divide-y divide-gray-100 ">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={twMerge(
                  'px-4 py-3 text-left text-sm font-medium text-gray-900',
                  col.className
                )}
              >
                <span
                  aria-hidden="true"
                  title="sort"
                  className={clsx('inline-flex items-center justify-between', {
                    'cursor-pointer': col?.sortBy,
                  })}
                  onClick={() =>
                    col?.sortBy && handleSort(col?.sortBy, col?.sortIteratee)
                  }
                >
                  {col.title}

                  {/* sort icon */}
                  {col?.sortBy && (
                    <span className="flex items-center">
                      <ArrowLongUpIcon
                        className={clsx('w-3 h-3 translate-x-1', {
                          'text-primary':
                            sortedInfo?.columnKey === col?.sortBy &&
                            sortedInfo?.order === 'asc',
                        })}
                      />

                      <ArrowLongDownIcon
                        className={clsx('w-3 h-3 translate-x-[-2px]', {
                          'text-primary':
                            sortedInfo?.columnKey === col?.sortBy &&
                            sortedInfo?.order === 'desc',
                        })}
                      />
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        {loading && (
          <div className="w-full h-full text-gray-500 flex flex-col items-center justify-center gap-2 absolute top-0 left-0 z-1 pb-10 bg-white/50">
            <Loading className="h-6 w-6 text-primary" />
          </div>
        )}

        {!loading && data.length === 0 && (
          <div className="w-full h-full text-gray-500 flex flex-col items-center justify-center gap-2 absolute top-[44px] left-0 z-1 pb-10 bg-white">
            <FolderOpenIcon className="w-10 h-10" />
            <p className="text-sm">{noDataText ?? 'No data'}</p>
          </div>
        )}

        <tbody className="divide-y divide-gray-200">
          {sortedData.map((record, index) => (
            <tr key={`record-${index}`}>
              {columns.map((col) => (
                <td
                  key={`record-${index}-${col.key ?? col.dataIndex}`}
                  className={twMerge(
                    'py-2 px-4 text-sm text-gray-900',
                    col.className
                  )}
                >
                  <div className="flex items-center">
                    {col.render
                      ? col.render(record, index)
                      : record[col.key ?? col.dataIndex ?? ''] ?? null}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
