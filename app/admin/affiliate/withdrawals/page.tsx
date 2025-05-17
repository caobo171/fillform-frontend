'use client';

import { Fragment, useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useAdminWithdrawals, markWithdrawalAsDone } from '@/hooks/affiliate';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import LoadingAbsolute from '@/components/loading';
import { useMe } from '@/hooks/user';
import { SearchIcon, CheckCircle, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import { LocalPagination } from '@/components/common/LocalPagination';
import { Modal } from '@/components/common/Modal';
import { useQueryString } from '@/hooks/useQueryString';
import { RawWithdrawalRequest } from '@/store/types';

const ITEMS_PER_PAGE = 10;

export default function WithdrawalRequests() {
  const [isLoading, setIsLoading] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const me = useMe();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const page = Number(searchParams.get('page') || '1');
  const { createQueryString } = useQueryString();

  const withdrawalRequests = useAdminWithdrawals(page, ITEMS_PER_PAGE, {
    q: query
  });

  const onPageChange = useCallback(
    (value: number) => {
      router.push(`${pathname}?${createQueryString('page', String(value))}`);
    },
    [createQueryString, pathname, router]
  );

  const handleSearch = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        const { value } = e.currentTarget;
        router.push(`${pathname}?${createQueryString('q', String(value))}`);
      }
    },
    [createQueryString, pathname, router]
  );

  useEffect(() => {
    const searchQuery = searchParams.get('q') || '';
    setQuery(searchQuery);
    
    // Only mutate once after state updates are complete
    const timeoutId = setTimeout(() => {
      withdrawalRequests.mutate();
    }, 0);
    
    return () => clearTimeout(timeoutId);
  }, [searchParams]);

  const openConfirmation = (id: string) => {
    setSelectedRequestId(id);
    setConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setConfirmationOpen(false);
    setSelectedRequestId(null);
  };

  const handleMarkAsDone = async (id: string) => {
    setIsLoading(true);
    try {
      const res = await markWithdrawalAsDone(id);
      if (res.data.code === Code.SUCCESS) {
        Toast.success('Đã đánh dấu yêu cầu rút tiền là hoàn thành');
        withdrawalRequests.mutate();
      } else {
        Toast.error(res.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      Toast.error('Lỗi khi cập nhật trạng thái yêu cầu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold text-gray-900">Affiliate Withdrawal Requests</h1>
            <p className="mt-2 text-sm text-gray-700">
              Danh sách tất cả các yêu cầu rút tiền affiliate
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <div className="mt-2 grid grid-cols-1">
              <input
                id="search"
                name="search"
                type="text"
                placeholder="Nhấn enter để tìm kiếm"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
                onKeyDown={handleSearch}
                className="col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pl-10 pr-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:pl-9 sm:text-sm/6"
              />
              <SearchIcon
                aria-hidden="true"
                className="pointer-events-none col-start-1 row-start-1 ml-3 size-5 self-center text-gray-400 sm:size-4"
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <LoadingAbsolute />
        ) : (<> </>)}

        <div className="mt-4 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">

              {
                (withdrawalRequests.isLoading) ? (
                  <div className="flex flex-col gap-4 w-full">
                    <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

                    <div className="flex flex-wrap gap-4">
                      {[1, 2, 3, 4].map((item) => (
                        <div
                          key={`loading_${item}`}
                          className="h-[32px] w-full rounded-lg bg-gray-200 animate-pulse"
                        />
                      ))}
                    </div>
                  </div>
                ) : <>
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          #
                        </th>
                        <th scope="col" className="py-3.5 md:pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                          Thông tin tài khoản
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Số tiền
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Trạng thái
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Ngày yêu cầu
                        </th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {withdrawalRequests?.data?.requests?.map((request: RawWithdrawalRequest, index: number) => (
                        <tr key={request.id}>
                          <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                            {((page - 1) * ITEMS_PER_PAGE + index + 1).toString().padStart(2, '0')}
                          </td>

                          <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                            <div className="flex items-center">
                              <div className="">
                                <div className="font-medium text-gray-900">{request.accountName}</div>
                                <div className="mt-1 text-gray-500">
                                  {request.bankName} - {request.accountNumber}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-sm font-medium text-gray-900">
                            {request.amount?.toLocaleString()} VND
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                            <span className={clsx(
                              'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                              request.status === 'done' ? 'bg-green-50 text-green-700 ring-green-600/20' : '',
                              request.status === 'pending' ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20' : '',
                            )}>
                              {request.status === 'done' ? 'Đã thanh toán' : request.status === 'pending' ? 'Đang xử lý' : request.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                            {new Date(request.createdAt).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                            {request.status !== 'done' ? (
                              <button
                                onClick={() => openConfirmation(request.id)}
                                className="inline-flex items-center gap-1 px-3 py-2 text-green-600 hover:bg-green-50 rounded"
                                title="Đánh dấu đã thanh toán"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Đánh dấu đã thanh toán</span>
                              </button>
                            ) : (
                              <button
                                disabled
                                className="inline-flex items-center gap-1 px-3 py-2 text-gray-300 cursor-not-allowed"
                                title="Đã thanh toán"
                              >
                                <CheckCircle className="w-5 h-5" />
                                <span>Đã thanh toán</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              }
            </div>
          </div>
        </div>

        {/* Pagination */}
        <LocalPagination
          total={withdrawalRequests?.data?.total || 0}
          current={page}
          pageSize={ITEMS_PER_PAGE}
          onChange={onPageChange}
        />
      </div>

      {/* Confirmation Modal */}
      <Modal
        open={confirmationOpen}
        onCancel={closeConfirmation}
        onOk={() => {
          if (selectedRequestId) {
            handleMarkAsDone(selectedRequestId);
            closeConfirmation();
          }
        }}
        title={
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span>Xác nhận thanh toán</span>
          </div>
        }
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ type: 'solid', className: 'bg-green-600 hover:bg-green-700' }}
      >
        <p className="text-gray-700">
          Bạn có chắc chắn muốn đánh dấu yêu cầu rút tiền này là đã thanh toán?
        </p>
        <p className="text-gray-700 mt-2">
          Hành động này không thể hoàn tác sau khi đã xác nhận.
        </p>
      </Modal>
    </>
  );
}
