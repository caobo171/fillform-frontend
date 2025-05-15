'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { useMyForms, useUserForms } from '@/hooks/form';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SearchIcon } from 'lucide-react';
import { LocalPagination } from '@/components/common/LocalPagination';
import { useQueryString } from '@/hooks/useQueryString';
const ITEMS_PER_PAGE = 10;


export default function FormLists({ admin }: { admin?: boolean }) {
  const [currentFormPage, setCurrentFormPage] = useState(1);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const router = useRouter();
  const pathname = usePathname();
  const page = Number(searchParams.get('page') || '1');
  const { createQueryString } = useQueryString();



  let dataForm = null;
  const params = useParams();
  const userId = params.id as string;

  const inAdminList = admin && !userId;
  if (admin) {
    dataForm = useUserForms(currentFormPage, ITEMS_PER_PAGE, userId, {
      q: search
    });
  } else {
    dataForm = useMyForms(currentFormPage, ITEMS_PER_PAGE, {
      q: search
    });
  }

  const onPageChange = useCallback(
    (value: number) => {
      setCurrentFormPage(value);

      if (inAdminList) {
        router.push(`${pathname}?${createQueryString('page', String(value))}`);
      }
    },
    [createQueryString, pathname, router, inAdminList]
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget;
  
        if (inAdminList) {
          router.push(`${pathname}?${createQueryString('q', String(value))}`);
        } else {
          setSearch(value);
          dataForm.mutate();
          setCurrentFormPage(1);
        }
      }
    },
    [createQueryString, pathname, router, inAdminList]
  );

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setSearch(searchQuery);
    setCurrentFormPage(page);
    
    // Only mutate once after state updates are complete
    const timeoutId = setTimeout(() => {
      dataForm.mutate();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchParams, page]);

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Tất cả Dữ liệu Forms</h1>
          <p className="mt-2 text-sm text-gray-700">
            Danh sách form
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <div className="mt-2 grid grid-cols-1">
            <input
              id="email"
              name="email"
              type="text"
              value={search}
              onKeyDown={handleSearch}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nhấn enter để tìm form"
              className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:pl-9 sm:text-sm/6"
            />
            <SearchIcon
              aria-hidden="true"
              className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
            />
          </div>
        </div>
      </div>


      <div className="mt-4 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

            {
              (dataForm.isLoading || dataForm.isValidating) ? (
                <div className="flex flex-col gap-4">
                  <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

                  <div className="flex gap-4 flex-wrap">
                    {[1, 2, 3, 4].map((item) => (
                      <div
                        key={`recent_podcast_${item}`}
                        className="h-[32px] w-full rounded-lg bg-gray-200 animate-pulse"
                      />
                    ))}
                  </div>
                </div>
              ) : (<>
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        #
                      </th>
                      <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                        Tên form
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Ngày tạo
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Hành động
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {dataForm?.data?.forms?.map((form, index) => (
                      <tr key={form.id}>
                        <td className="whitespace-nowrap py-4 md:pl-4 pr-3 text-sm sm:pl-0">
                          {((currentFormPage - 1) * ITEMS_PER_PAGE + index + 1).toString().padStart(2, '0')}
                        </td>

                        <td className="whitespace-nowrap py-4 md:pl-4 pr-3 text-sm sm:pl-0">
                          <div className="flex items-center">
                            <div className="">
                              <div className="font-medium text-gray-900 truncate w-[120px] md:w-[300px] lg:w-[700px]">{form?.name || 'Unknown'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{new Date(form.createdAt).toLocaleDateString()}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">

                          <button
                            type="button"
                            onClick={() => router.push(`/form/${form.id}`)}
                            className="rounded bg-primary px-2 py-1 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>)
            }


          </div>
        </div>
      </div>

      <LocalPagination
        total={dataForm?.data?.form_num || 0}
        current={currentFormPage}
        pageSize={ITEMS_PER_PAGE}
        onChange={onPageChange}
      />
    </div>
  );
}
