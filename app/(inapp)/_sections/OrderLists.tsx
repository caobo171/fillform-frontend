'use client';

import { Fragment, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMyOrders, useUserOrders } from '@/hooks/order';
import { ORDER_STATUS, OPTIONS_DELAY, Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import LoadingAbsolute from '@/components/loading';
import { SocketService } from '@/services/SocketClient';
import { MeHook } from '@/store/me/hooks';
import { Helper } from '@/services/Helper';
import { useMe } from '@/hooks/user';
import { SearchIcon } from 'lucide-react';
import clsx from 'clsx';
const ITEMS_PER_PAGE = 10;


export default function OrderLists({ admin }: { admin?: boolean }) {
    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    let dataOrder = null;
    const params = useParams();
    const userId = params.id as string;
    if (admin){
        dataOrder = useUserOrders(currentOrderPage, ITEMS_PER_PAGE, userId)
    } else {
        dataOrder = useMyOrders(currentOrderPage, ITEMS_PER_PAGE);
    }

    
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const me = useMe();

    const totalOrderPages = Math.ceil((dataOrder?.data?.order_num || 0) / ITEMS_PER_PAGE)


    useEffect(() => {

        if (me.data) {
            (async () => {
                await Helper.waitUntil(() => {
                    return SocketService.socket;
                })

                SocketService.socket.on('order_running', () => {
                    dataOrder.mutate();
                })

                SocketService.socket.on('order_completed', () => {
                    dataOrder.mutate();
                })

                return () => {
                    SocketService.socket.off('order_running');
                    SocketService.socket.off('order_completed');
                }
            })()

        }

    }, [me.data]);


    const handlePauseOrder = async (id: string) => {
        setIsLoading(true);
        try {
            const rest = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/pause', { id });
            if (rest.data.code === Code.SUCCESS) {
                Toast.success('Đã tạm dừng đơn hàng');
                dataOrder.mutate();
            } else {
                Toast.error(rest.data.message);
            }
        } catch (error) {
            Toast.error('Lỗi khi tạm dừng đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinueOrder = async (id: string) => {
        setIsLoading(true);
        try {
            const rest = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/continue', { id });
            if (rest.data.code === Code.SUCCESS) {
                Toast.success('Đã tiếp tục đơn hàng');
                dataOrder.mutate();
            } else {
                Toast.error(rest.data.message);
            }
        } catch (error) {
            console.log(error);
            Toast.success('Lỗi khi tiếp tục đơn hàng');
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Danh sách tất cả các lượt chạy form của bạn
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <div className="mt-2 grid grid-cols-1">
                        <input
                            id="email"
                            name="email"
                            type="text"
                            placeholder="Nhấn enter để tìm order"
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


            {dataOrder.isLoading ? (
                <div className="flex flex-col gap-4">
                    <div className="w-[150px] h-[28px] rounded-lg bg-gray-200 animate-pulse" />

                    <div className="flex flex-nowrap gap-10">
                        {[1, 2, 3, 4].map((item) => (
                            <div
                                key={`recent_podcast_${item}`}
                                className="h-[96px] w-1/2 rounded-lg bg-gray-200 animate-pulse"
                            />
                        ))}
                    </div>
                </div>
            ) : <></>}

            <div className="mt-4 flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
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
                                        Số lượng
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                        Trạng thái
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
                                {dataOrder?.data?.orders?.map((order, index) => (
                                    <tr key={order.id}>
                                        <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                                            {((currentOrderPage - 1) * ITEMS_PER_PAGE + index + 1).toString().padStart(2, '0')}
                                        </td>

                                        <td className="whitespace-nowrap py-2 md:pl-4 pr-3 text-sm sm:pl-0">
                                            <div className="flex items-center">
                                                <div className="">
                                                    <div className="font-medium text-gray-900 truncate w-[120px] md:w-[300px] lg:w-[600px]">{order.name}</div>
                                                    <div className="mt-1 text-gray-500">
                                                        {order.type}
                                                        &nbsp;-&nbsp;
                                                        {OPTIONS_DELAY[order.delay as keyof typeof OPTIONS_DELAY].name}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            {order.status === ORDER_STATUS.SUCCESS ? (
                                                <div className="text-gray-900">{order.num} / {order.num}</div>
                                            ) : (
                                                <div className="text-gray-900">{order.passed_num || 0} / {order.num}</div>
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            <span className={clsx(
                                                'inline-flex items-center rounded-md  px-2 py-1 text-xs font-medium ring-1 ring-inset ring-green-600/20',
                                                order.status === ORDER_STATUS.SUCCESS ? 'bg-green-50 text-green-700' : '',
                                                order.status === ORDER_STATUS.PAUSE ? 'bg-yellow-50 text-yellow-700' : '',
                                                order.status === ORDER_STATUS.RUNNING ? 'bg-blue-50 text-blue-700' : '',
                                            )}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-500">
                                            {order.status === ORDER_STATUS.RUNNING ? (
                                                <button
                                                    onClick={() => handlePauseOrder(order.id)}
                                                    className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded"
                                                    title="Tạm dừng"
                                                >
                                                    <span className="sr-only">Tạm dừng</span>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                                                    </svg>
                                                </button>
                                            ) : order.status === ORDER_STATUS.PAUSE ? (
                                                <button
                                                    onClick={() => handleContinueOrder(order.id)}
                                                    className="inline-flex items-center p-2 text-green-600 hover:bg-green-50 rounded"
                                                    title="Tiếp tục chạy"
                                                >
                                                    <span className="sr-only">Tiếp tục</span>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                    </svg>
                                                </button>
                                            ) : <>
                                                <button
                                                    disabled
                                                    className="inline-flex items-center p-2 text-gray-300 hover:bg-gray-50 rounded"
                                                    title="Tiếp tục chạy"
                                                >
                                                    <span className="sr-only">Order đã hoàn thành</span>
                                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                    </svg>
                                                </button>
                                            </>}
                                            <button
                                                onClick={() => router.push(`/order/detail/${order.id}`)}
                                                className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Xem chi tiết Order"
                                            >
                                                <span className="sr-only">Chi tiết</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => window.open(order.url, '_blank', 'noopener,noreferrer')}
                                                className="inline-flex items-center p-2 text-blue-600 hover:bg-blue-50 rounded"
                                                title="Xem Google Form"
                                            >
                                                <span className="sr-only">Form</span>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Orders Pagination */}
            <div className="mt-4 flex justify-center gap-2">
                {[...Array(totalOrderPages)].map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setCurrentOrderPage(i + 1)}
                        className={`px-3 py-1 rounded ${currentOrderPage === i + 1
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200'
                            }`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
        </div>
    )



    // return (
    //     <div className="bg-white rounded-lg p-6 shadow-sm">
    //         <h2 className="text-xl font-bold mb-4">Tất cả Order</h2>
    //         {isLoading ? (
    //             <LoadingAbsolute />
    //         ) : (<> </>)}
    //         {dataOrder?.data?.orders && dataOrder?.data?.orders.length > 0 ? (
    //             <>
    //                 <div className="overflow-x-auto">
    //                     <table className="w-full">
    //                         <thead className="bg-gray-50">
    //                             <tr>
    //                                 <th className="px-4 py-2 text-left">#</th>
    //                                 <th className="px-4 py-2 text-left">Tên Form</th>
    //                                 <th className="px-4 py-2 text-left min-w-[120px]">Số lượng</th>
    //                                 <th className="px-4 py-2 text-left min-w-[140px]">Loại</th>
    //                                 <th className="px-4 py-2 text-left min-w-[120px]">Ngày tạo</th>
    //                                 <th className="px-4 py-2 text-left min-w-[120px]">Trạng thái</th>
    //                                 <th className="px-4 py-2 text-left min-w-[160px]">Hành động</th>
    //                             </tr>
    //                         </thead>
    //                         <tbody>
    //                             {dataOrder?.data?.orders?.map((order, index) => (
    //                                 <tr key={order.id} className="border-t">
    //                                     <td className="px-4 py-2">{(currentOrderPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
    //                                     <td title={order.name} className="px-4 py-2 truncate max-w-[200px]">
    //                                         <div className="truncate">{order.name}</div>
    //                                     </td>

    //                                     {order.status === ORDER_STATUS.SUCCESS ? (
    //                                         <td className="px-4 py-2">{order.num} / {order.num}</td>
    //                                     ) : (
    //                                         <td className="px-4 py-2">{order.passed_num || 0} / {order.num}</td>
    //                                     )}
    //                                     <td className="px-4 py-2">
    //                                         {order.type}
    //                                         <br />
    //                                         {OPTIONS_DELAY[order.delay as keyof typeof OPTIONS_DELAY].name}
    //                                     </td>
    //                                     <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
    //                                     <td className="px-4 py-2">{order.status}</td>
    //                                     <td className="px-4 py-2 space-x-2">

    //                                     </td>
    //                                 </tr>
    //                             ))}
    //                         </tbody>
    //                     </table>
    //                 </div>

    //             </>
    //         ) : (
    //             <p className="text-gray-500">Hiện bạn chưa tạo Order nào trên hệ thống</p>
    //         )}
    //     </div>
    // );
}
