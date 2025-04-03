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
import { FC, useState, useMemo, useEffect } from 'react'




const OrderPage = () => {

    const params = useParams();
    const me = useMe();
    const order = useOrderById(params.id as string)
    const [isFetching, setIsFetching] = useState(false)
    // Note: You'll need to fetch this data from your API
    const isAdmin = me.data?.is_super_admin;

    let estimatedEndTime = useMemo(() => {
        if (!order.data?.order_detail_list){
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



    return (
        <section className="py-12">
            {isFetching && <LoadingAbsolute />}
            <div className="container mx-auto text-center">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6">Xem chi tiết Order</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                        <div className="lg:col-span-4 order-2 lg:order-1">
                            <p>
                                Người tạo: <b>{order.data?.order.owner}</b><br />
                                Hình thức: <b>{order.data?.order.type}</b><br />
                                Điền rải: <b>{OPTIONS_DELAY[(order.data?.order.delay || 0) as keyof typeof OPTIONS_DELAY].name}</b><br />
                                Tình trạng: <b>{order.data?.order.status}</b><br />

                                {
                                    order.data?.order.status === ORDER_STATUS.RUNNING && (
                                        <span>Thời gian dự kiến hoàn thành: <b>{estimatedEndTime ? new Date(estimatedEndTime).toLocaleString() : 'Chưa có dữ liệu'}</b></span>
                                    )
                                }

                                {order.data?.order.status === ORDER_STATUS.RUNNING && (
                                    <span> - Order có thể được dừng bởi người dùng, hoặc dừng do không trong thời gian rải đơn (từ 7-22h hằng ngày)</span>
                                )}
                            </p>
                        </div>

                        <div className="lg:col-span-8 order-1 lg:order-2">
                            <p>
                                Tên Form: <b className="overflow-hidden">
                                    <a href={order.data?.order.url} className="text-black hover:underline">{order.data?.order.name}</a>
                                </b><br />
                                Tổng Order Request: <b>{order.data?.order.num}</b><br />
                                Số Request đã chạy: <b>{order.data?.order_detail_list.filter(e => e.result === "completed").length}</b><br />
                                Các request bị lỗi: {(order.data?.order_fail_list?.length || 0) > 0 ? (
                                    order.data?.order_fail_list.map((fail: any, i: any) => <b key={i}>{fail}; </b>)
                                ) : (
                                    <b>Chưa có lỗi</b>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {isAdmin ? (
                    <div className="text-left mb-8">
                        <h2 className="text-2xl font-bold mb-4">Config Order</h2>
                        <p className="mb-4">Hãy chắc chắn đã ấn <b>Tạm dừng</b> trước khi thực hiện <b>bất cứ thao tác nào</b> với order</p>

                        {/* Admin Controls */}
                        <div className="flex gap-2 mb-4">
                            {order.data?.order.status === ORDER_STATUS.SUCCESS ? (
                                <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50">Continue</button>
                            ) : order.data?.order.status === ORDER_STATUS.RUNNING ? (
                                <button
                                    onClick={() => orderPause()}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                >
                                    Pause
                                </button>
                            ) : (
                                <button
                                    onClick={() => orderContinue()}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                >
                                    Continue
                                </button>
                            )}
                            <button
                                onClick={() => orderStop()}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            >
                                Stop
                            </button>
                            <button
                                onClick={() => orderClone()}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                                Clone
                            </button>
                        </div>

                        {/* Order Details List */}
                        <h2 className="text-2xl font-bold my-4">Danh sách request</h2>
                        <div className="flex flex-wrap gap-4 border-box">
                            {order.isLoading && (
                                <Loading />
                            )}
                            {order.data?.order_detail_list.map((detail, index) => (
                                <div key={index} className="flex text-sm w-1/4">
                                    <div className="w-1/4 bg-gray-100 p-2">{detail.index}</div>
                                    <div className="w-1/4 bg-gray-100 p-2">{detail.result?.toUpperCase()}</div>
                                    <div className="w-1/4 bg-gray-100 p-2">Start at {new Date(Number(detail.start_time)).toLocaleString()}</div>
                                    <a href={detail.data} target='_blank' className="w-1/4 border border-gray-300 text-center hover:bg-gray-50 flex items-center justify-center">
                                        Xem
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <></>
                )}

                {/* Form Config */}
                <div className="text-left">
                    <h2 className="text-2xl font-bold mb-4">Config Form</h2>
                    <form className="bg-gray-50 p-4">
                        {order.data?.order.data.map((question, qIndex) => (
                            <div key={qIndex} className="p-4 border-b">
                                <div className="grid lg:grid-cols-12 gap-4">
                                    <div className="lg:col-span-4">
                                        <b>{question.question}</b>
                                        {question.description && (
                                            <p className="text-sm text-gray-600">{question.description}</p>
                                        )}
                                    </div>

                                    <div className="lg:col-span-8">
                                        {question.type ? (
                                            <div className="gap-4 flex flex-wrap">
                                                {question.answer.map((answer: any, aIndex: any) => (
                                                    answer.data && (
                                                        <div key={aIndex} className="flex border-gray-300 border rounded overflow-hidden">
                                                            <div className="w-3/5 bg-gray-100 p-2">{answer.data}</div>
                                                            <input
                                                                type="number"
                                                                name={answer.id}
                                                                id={answer.id}
                                                                defaultValue={answer.count}
                                                                className="w-2/5 border p-2"
                                                            />
                                                        </div>
                                                    )
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="grid gap-2">
                                                {question.answer.map((answer: any, aIndex: any) => (
                                                    <div key={aIndex} className="flex">
                                                        <label className="w-2/3 bg-gray-100 p-2">
                                                            Chọn loại câu hỏi tự luận
                                                        </label>
                                                        <select
                                                            name={answer.id}
                                                            id={answer.id}
                                                            defaultValue={answer.count}
                                                            className="w-1/3 border p-2"
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
                    </form>
                </div>
            </div>
        </section>
    )
}

export default OrderPage