'use client';

import { Fragment } from 'react';
import { useForms } from '@/hooks/form';
import Link from 'next/link';

export default function FormLists() {
  const { data, isLoading } = useForms();


  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

        <div className="flex flex-nowrap gap-10">
          {[1, 2].map((item) => (
            <div
              key={`recent_podcast_${item}`}
              className="h-[96px] w-1/2 rounded-lg bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Fragment >
      <tr className="text-sm/6 text-gray-900">
        <th scope="colgroup" colSpan={3} className="relative isolate py-2 font-semibold">
          Forms
          <div className="absolute inset-y-0 right-full -z-10 w-screen border-b border-gray-200 bg-gray-50" />
          <div className="absolute inset-y-0 left-0 -z-10 w-screen border-b border-gray-200 bg-gray-50" />
        </th>
      </tr>
      {data?.forms.map((form) => (
        <tr key={form.id}>
          <td className="relative py-5 pr-6">
            <div className="flex gap-x-6">
              <div className="flex-auto">
                <div className="flex items-start gap-x-3">
                  <div className="text-sm/6 font-medium text-gray-900">{form.name}</div>

                </div>
              </div>
            </div>
            <div className="absolute bottom-0 right-full h-px w-screen bg-gray-100" />
            <div className="absolute bottom-0 left-0 h-px w-screen bg-gray-100" />
          </td>
          <td className="hidden py-5 pr-6 sm:table-cell">
            <div className="text-sm/6 text-gray-900">
              <time dateTime={form.createdAt}>{form.createdAt}</time>
            </div>

          </td>
          <td className="py-5 text-right">
            <div className="flex justify-end">
              <Link
                href={`form/fill/${form.id}`}
                className="text-sm/6 font-medium text-indigo-600 hover:text-indigo-500"
              >
                Xem chi tiết
              </Link>
            </div>
          </td>
        </tr>
      ))}
    </Fragment>
  );
}
