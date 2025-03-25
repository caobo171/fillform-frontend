'use client'

import { OPTIONS_DELAY, ORDER_STATUS } from '@/core/Constants'
import { useFormById } from '@/hooks/form'
import { useOrderById } from '@/hooks/order'
import { useParams } from 'next/navigation'
import { FC } from 'react'

interface Answer {
    id: string
    data?: string
    count: string | number
}

interface Question {
    question: string
    description?: string
    type?: boolean
    answer: Answer[]
}

interface OrderDetail {
    index: number
    result: string
    data: string
}

interface Order {
    _id: string
    owner: string
    type: string
    delay: number
    status: string
    url: string
    name: string
    num: number
    data: Question[]
}

interface OrderPageProps {
    params: { id: string }
}

const OrderPage: FC<OrderPageProps> = () => {

    const params = useParams()
    const order = useOrderById(params.id as string)
    // Note: You'll need to fetch this data from your API
    const isAdmin = true // Replace with actual auth check

    return (
        <section className="py-12">
            <div className="container mx-auto text-center">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold mb-6">Xem chi tiết Order</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">
                        <div className="lg:col-span-4 order-2 lg:order-1">
                            <p>
                                Người tạo: <b>{order.data?.order.owner}</b><br />
                                Hình thức: <b>{order.data?.order.type}</b><br />
                                Điền rải: <b>{OPTIONS_DELAY[(order.data?.order.delay || 0) as keyof typeof OPTIONS_DELAY].name}</b><br />
                                Tình trạng: <b>{order.data?.order.status}</b>
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
                                Số Request đã chạy: <b>{order.data?.order.num}</b><br />
                                Các request bị lỗi: {(order.data?.order_fail_list?.length || 0) > 0 ? (
                                    order.data?.order_fail_list.map((fail: any, i: any) => <b key={i}>{fail}; </b>)
                                ) : (
                                    <b>Chưa có lỗi</b>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="text-left mb-8">
                        <h2 className="text-2xl font-bold mb-4">Config Order</h2>
                        <p className="mb-4">Hãy chắc chắn đã ấn <b>Tạm dừng</b> trước khi thực hiện <b>bất cứ thao tác nào</b> với order</p>

                        {/* Admin Controls */}
                        <div className="flex gap-2 mb-4">
                            {order.data?.order.status === ORDER_STATUS.SUCCESS ? (
                                <button disabled className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-50">Continue</button>
                            ) : order.data?.order.status === ORDER_STATUS.RUNNING ? (
                                <button 
                                    onClick={() => window.location.href = `/order/pause/${order.data?.order.id}`}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                >
                                    Pause
                                </button>
                            ) : (
                                <button 
                                    onClick={() => window.location.href = `/order/continue/${order.data?.order.id}`}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors"
                                >
                                    Continue
                                </button>
                            )}
                            <button 
                                onClick={() => window.location.href = `/order/stop/${order.data?.order.id}`}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                            >
                                Stop
                            </button>
                            <button 
                                onClick={() => window.location.href = `/order/clone/${order.data?.order.id}`}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                            >
                                Clone
                            </button>
                        </div>

                        {/* Order Details List */}
                        <h2 className="text-2xl font-bold my-4">Danh sách request</h2>
                        <div className="grid gap-2">
                            {order.data?.order_detail_list.map((detail, index) => (
                                <div key={index} className="flex text-sm">
                                    <div className="w-1/4 bg-gray-100 p-2">{detail.index}</div>
                                    <div className="w-1/3 bg-gray-100 p-2">{detail.result}</div>
                                    <a href={detail.data} className="w-5/12 border border-gray-300 text-center hover:bg-gray-50">
                                        Xem
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
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
                                            <div className="grid gap-2">
                                                {question.answer.map((answer: any, aIndex: any) => (
                                                    answer.data && (
                                                        <div key={aIndex} className="flex">
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