'use client'

import LoadingAbsolute, { Loading } from '@/components/loading'
import { Code, OPTIONS_DELAY, ORDER_STATUS } from '@/core/Constants'
import { useFormById } from '@/hooks/form'
import { useOrderById } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import Fetch from '@/lib/core/fetch/Fetch'
import { Helper } from '@/services/Helper'
import { SocketService } from '@/services/SocketClient'
import { Toast } from '@/services/Toast'
import { RawOrder } from '@/store/types'
import { useParams } from 'next/navigation'
import { FC, useState, useMemo, useEffect, use } from 'react'
import Link from 'next/link'
import clsx from 'clsx'




const OrderPage = () => {

    const params = useParams();
    const me = useMe();
    const order = useOrderById(params.id as string)
    const [isFetching, setIsFetching] = useState(false)
    // Note: You'll need to fetch this data from your API
    const isAdmin = me.data?.is_super_admin;

    const [owner, setOwner] = useState(order.data?.order.owner)
    const [delay, setDelay] = useState(order.data?.order.delay);
    
    useEffect(() => {
        setOwner(order.data?.order.owner)
        setDelay(order.data?.order.delay)
    }, [order.data?.order])

    let estimatedEndTime = useMemo(() => {
        if (!order.data?.order_detail_list) {
            return 0;
        }

        if (order.data?.order_detail_list.length > 0) {
            return Math.max(...order.data?.order_detail_list.map(e => (e.start_time || 0)))
        }
        return 0
    }, [order.data?.order_detail_list, order.data?.order.delay]);


    const orderContinue = async () => {
        setIsFetching(true)
        try {

            const res = await Fetch.postWithAccessToken<{ code: number }>('/api/order/continue', {
                id: params.id as string
            })

            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Order đã được tiếp tục');
            }
        } catch (error) {
            Toast.error('Lỗi khi tiếp tục order');
        } finally {
            setIsFetching(false)
        }
    }

    const orderStop = async () => {
        setIsFetching(true)
        try {
            const res = await Fetch.postWithAccessToken<{ code: number }>('/api/order/stop', {
                id: params.id as string
            })

            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Order đã được dừng');
            }
        } catch (error) {
            Toast.error('Lỗi khi dừng order');
        } finally {
            setIsFetching(false)
        }
    };

    const onSaveChange = async () => {
        setIsFetching(true)
        try {
            const res = await Fetch.postWithAccessToken<{ code: number }>('/api/order/update', {
                id: params.id as string,
                owner: owner,
                delay: delay
            })

            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Thay đổi đã được lưu');
            }
        } catch (error) {
            Toast.error('Lỗi khi lưu thay đổi');
        } finally {
            setIsFetching(false)
        }
    }

    const orderClone = async () => {
        setIsFetching(true)
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, cloned_order: RawOrder, order: RawOrder }>('/api/order/clone', {
                id: params.id as string
            })

            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Order đã được clone');
                window.open(`/order/detail/${res.data.cloned_order.id}`, '_blank');
            }
        } catch (error) {
            Toast.error('Lỗi khi clone order');
        } finally {
            setIsFetching(false)
        }
    }

    const orderPause = async () => {
        setIsFetching(true)
        try {
            const res = await Fetch.postWithAccessToken<{ code: number }>('/api/order/pause', {
                id: params.id as string
            })

            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Order đã được tạm dừng');
            }
        } catch (error) {
            Toast.error('Lỗi khi tạm dừng order');
        } finally {
            setIsFetching(false)
        }
    }



    useEffect(() => {

        if (me) {
            (async () => {
                await Helper.waitUntil(() => {
                    return SocketService.socket;
                })

                SocketService.socket.on('order_running', (data: any) => {

                    console.log('order_running', data)
                    order.mutate();
                })

                SocketService.socket.on('order_completed', (data: any) => {
                    console.log('order_completed', data)
                    order.mutate();
                })

                return () => {
                    SocketService.socket.off('order_running');
                    SocketService.socket.off('order_completed');
                }
            })()

        }

    }, [me]);



    if (order.isLoading) {
        return <Loading />
    }

    console.log(order.data?.order.status)


    return (
        <section className="py-12 bg-white">
            {isFetching && <LoadingAbsolute />}
            <div className="container mx-auto text-center" data-aos="fade-up">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-4">Chi tiết Order</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm0-8a1 1 0 10-2 0v4a1 1 0 102 0V5z" clipRule="evenodd" />
                                </svg>
                                Thông tin Order
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Người tạo:</span>
                                    <span className="font-semibold">{order.data?.order.owner}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Hình thức:</span>
                                    <span className="font-semibold">{order.data?.order.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Điền rải:</span>
                                    <span className="font-semibold">{OPTIONS_DELAY[(order.data?.order.delay || 0) as keyof typeof OPTIONS_DELAY].name}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tình trạng:</span>
                                    <span className={clsx("font-semibold px-2 py-1 rounded-full text-xs",
                                        order.data?.order.status === ORDER_STATUS.RUNNING ? "bg-blue-100 text-blue-800" : "",
                                        order.data?.order.status === ORDER_STATUS.PAUSE ? "bg-yellow-100 text-yellow-800" : "",
                                        order.data?.order.status === ORDER_STATUS.CANCELED ? "bg-red-100 text-red-800" : "",
                                        order.data?.order.status === ORDER_STATUS.SUCCESS ? "bg-green-100 text-green-800" : ""
                                    )}>
                                        {order.data?.order.status}
                                    </span>
                                </div>

                                {order.data?.order.status === ORDER_STATUS.RUNNING && (
                                    <div className="pt-2 border-t border-gray-100">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600">Dự kiến hoàn thành:</span>
                                            <span className="font-semibold text-primary-600">
                                                {estimatedEndTime ? new Date(estimatedEndTime).toLocaleString() : 'Chưa có dữ liệu'}
                                            </span>
                                        </div>
                                        <div className="mt-2 text-yellow-600 text-xs italic">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Order có thể được dừng bởi người dùng, hoặc dừng do không trong thời gian rải đơn (7-22h hằng ngày)
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Thông tin Form
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600">Tên Form:</span>
                                    <a href={order.data?.order.url} className="font-semibold text-primary-600 hover:underline text-right max-w-[60%] truncate">
                                        {order.data?.order.name}
                                    </a>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng Order Request:</span>
                                    <span className="font-semibold">{order.data?.order.num}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Số Request đã chạy:</span>
                                    <span className="font-semibold">{order.data?.order_detail_list.filter(e => e.result === "completed").length}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600">Các request bị lỗi:</span>
                                    <div className="text-right">
                                        {(order.data?.order_fail_list?.length || 0) > 0 ? (
                                            <div className="flex flex-wrap justify-end gap-1">
                                                {order.data?.order_fail_list.map((fail: any, i: any) => (
                                                    <span key={i} className="inline-block px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs">{fail}</span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="font-semibold text-green-600">Chưa có lỗi</span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Tiến độ:</span>
                                        <span className="font-semibold">
                                            {Math.round(((order.data?.order_detail_list?.filter(e => e.result === "completed")?.length || 0) / (order.data?.order.num || 1)) * 100)}%
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                        <div
                                            className="bg-primary-600 h-2.5 rounded-full"
                                            style={{ width: `${Math.round(((order.data?.order_detail_list?.filter(e => e.result === "completed")?.length || 0) / (order.data?.order.num || 1)) * 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="text-left mb-8 bg-white rounded shadow-sm p-4">
                        <h2 className="text-2xl font-bold mb-4">Quản lý Order</h2>
                        <div className="p-3 bg-yellow-50 text-yellow-800 rounded mb-4 text-sm">
                            <p>⚠️ Hãy chắc chắn đã ấn <b>Tạm dừng</b> trước khi thực hiện <b>bất cứ thao tác nào</b> với order</p>
                        </div>

                        {/* Admin Controls */}
                        <div className="flex flex-wrap gap-2 mb-6">
                            {order.data?.order.status === ORDER_STATUS.SUCCESS ? (
                                <button disabled className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed opacity-50">Tiếp tục</button>
                            ) : order.data?.order.status === ORDER_STATUS.RUNNING ? (
                                <button
                                    onClick={() => orderPause()}
                                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded transition-colors"
                                >
                                    Tạm dừng
                                </button>
                            ) : (
                                <button
                                    onClick={() => orderContinue()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                                >
                                    Tiếp tục
                                </button>
                            )}
                            <button
                                onClick={() => orderStop()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                            >
                                Dừng
                            </button>
                            <button
                                onClick={() => orderClone()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                            >
                                Clone
                            </button>
                        </div>


                        {
                            order.data?.order.status === ORDER_STATUS.PAUSE || order.data?.order.status === ORDER_STATUS.CANCELED ? (

                                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6 mb-8">

                                    <div className="sm:col-span-2 sm:col-start-1">
                                        <label htmlFor="city" className="block text-sm/6 font-medium text-gray-900">
                                            Owner
                                        </label>
                                        <div className="mt-2">
                                            <input
                                                id="owner"
                                                value={owner}
                                                onChange={(e) => setOwner(e.target.value)}
                                                name="owner"
                                                type="text"
                                                autoComplete="owner"
                                                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="region" className="block text-sm/6 font-medium text-gray-900">
                                            Loại điền rải
                                        </label>
                                        <div className="mt-2">
                                            <select
                                                id="delay"
                                                name="delay"
                                                value={delay}
                                                onChange={(e) => setDelay(e.target.value)}
                                                className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            >
                                                {
                                                    Object.keys(OPTIONS_DELAY).map((delay, index) => (
                                                        <option key={index} value={delay}>{OPTIONS_DELAY[delay as keyof typeof OPTIONS_DELAY].name}</option>
                                                    ))
                                                }
                                            </select>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <button
                                            onClick={() => onSaveChange()}
                                            className="mt-8 px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded transition-colors"
                                        >
                                            Lưu thay đổi
                                        </button>
                                    </div>
                                </div>

                            ) : <></>
                        }

                        {/* Order Details List */}
                        <h3 className="text-2xl font-bold mb-3">Danh sách request</h3>
                        <div className="bg-gray-50 p-3 rounded">
                            {order.isLoading ? (
                                <Loading />
                            ) : (
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                                    {order.data?.order_detail_list.map((detail, index) => (
                                        <div key={index} className="bg-white border border-gray-200 rounded overflow-hidden text-sm">
                                            <div className="flex">
                                                <div className="w-1/4 bg-gray-100 p-2">#{detail.index}</div>
                                                <div className={clsx("w-2/4 p-2",
                                                    detail.result === "completed" ? "bg-green-100 text-green-800" : "",
                                                    detail.result === "failed" ? "bg-red-100 text-red-800" : "",
                                                    detail.result === "pending" ? "bg-yellow-100 text-yellow-800" : "",
                                                    detail.result === "waiting" ? "bg-blue-100 text-blue-800" : "",
                                                    detail.result === "paused" ? "bg-purple-100 text-purple-800" : "",
                                                    detail.result === "stopped" ? "bg-gray-100 text-gray-800" : "",
                                                )}>
                                                    {detail.result?.toUpperCase()}
                                                </div>
                                                <a href={detail.data} target='_blank' className="w-1/4 text-center hover:bg-blue-50 flex items-center justify-center text-blue-600">
                                                    Xem
                                                </a>
                                            </div>
                                            {detail.start_time && (
                                                <div className="p-2 bg-gray-50 text-xs">
                                                    Bắt đầu: {new Date(Number(detail.start_time)).toLocaleString()}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Form Config */}
                <div className="text-left">
                    <h2 className="text-2xl font-bold mb-4">Cấu hình tỉ lệ Form</h2>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        {order.data?.order.data.map((question, qIndex) => (
                            <div key={qIndex} className="p-4 bg-white rounded shadow-sm text-xs mb-4">
                                <div className="md:flex md:items-start gap-8">
                                    <div className="md:w-1/4 mb-4 md:mb-0">
                                        {question.description ? (
                                            <>
                                                <label className="block font-bold mb-1 truncate w-full">{question.question}</label>
                                                <label className="block truncate w-full text-gray-400">{question.description}</label>
                                            </>
                                        ) : (
                                            <label className="block font-bold truncate w-full">{question.question}</label>
                                        )}
                                    </div>

                                    <div className="md:w-3/4">
                                        {question.type ? (
                                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                                                {question.answer.map((answer: any, aIndex: any) => (
                                                    answer.data && (
                                                        <div key={aIndex} className="relative">
                                                            <label
                                                                htmlFor="name"
                                                                className="absolute left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                            >
                                                                {answer.data}
                                                            </label>
                                                            <input
                                                                type="number"
                                                                name={answer.id}
                                                                id={answer.id}
                                                                defaultValue={answer.count}
                                                                className="block w-full rounded-md bg-white px-3 py-1.5 mt-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-sm/6"
                                                                disabled
                                                            />
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                {question.answer.map((answer: any, aIndex: any) => (
                                                    <div key={aIndex} className="relative w-full">
                                                        <label
                                                            className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                        >
                                                            Loại câu hỏi tự luận
                                                        </label>
                                                        <select
                                                            name={answer.id}
                                                            id={answer.id}
                                                            defaultValue={answer.count}
                                                            className="block w-full rounded-md bg-white px-3 py-1.5 mt-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6"
                                                            disabled
                                                        >
                                                            <option value={answer.count}>{answer.count}</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

export default OrderPage