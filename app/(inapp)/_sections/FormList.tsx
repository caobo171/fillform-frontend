'use client';

import { Fragment, useState } from 'react';
import { useMyForms } from '@/hooks/form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
const ITEMS_PER_PAGE = 10;
export default function FormLists() {
  const [currentFormPage, setCurrentFormPage] = useState(1);
  const router = useRouter();

  const dataForm = useMyForms(currentFormPage, ITEMS_PER_PAGE);
  const totalFormPages = Math.ceil((dataForm?.data?.form_num || 0) / ITEMS_PER_PAGE)

  if (dataForm.isLoading) {
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
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-4">Tất cả Dữ liệu Form</h2>
      {dataForm?.data?.forms && dataForm?.data?.forms.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">#</th>
                  <th className="px-4 py-2 text-left">Tên Form</th>
                  <th className="px-4 py-2 text-left min-w-[120px]">Ngày tạo</th>
                  <th className="px-4 py-2 text-left min-w-[120px]">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {dataForm?.data?.forms?.map((form, index) => (
                  <tr key={form.id} className="border-t">
                    <td className="px-4 py-2">{(currentFormPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                    <td className="px-4 py-2">{form.name}</td>
                    <td className="px-4 py-2">{new Date(form.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => router.push(`/form/fill/${form.id}`)}
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        Chi tiết
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Forms Pagination */}
          <div className="mt-4 flex justify-center gap-2">
            {[...Array(totalFormPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentFormPage(i + 1)}
                className={`px-3 py-1 rounded ${currentFormPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200'
                  }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-gray-500">Hiện bạn chưa tạo form nào trên hệ thống</p>
      )}
    </div>
  );
}
