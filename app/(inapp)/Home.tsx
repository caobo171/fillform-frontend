'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForms } from '@/hooks/form'
import { useOrders } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import { ORDER_STATUS } from '@/core/Constants'
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 10;

export default function HomePage() {
    const [currentFormPage, setCurrentFormPage] = useState(1)
    const [currentOrderPage, setCurrentOrderPage] = useState(1);
    
    const dataForm = useForms(currentFormPage, ITEMS_PER_PAGE);
    const dataOrder = useOrders(currentOrderPage, ITEMS_PER_PAGE);

    const me = useMe();
    const router = useRouter()

    // Pagination calculations
    const totalFormPages = Math.ceil((dataForm?.data?.form_num || 0) / ITEMS_PER_PAGE)
    const totalOrderPages = Math.ceil((dataOrder?.data?.order_num || 0) / ITEMS_PER_PAGE)

    const getDelayText = (delay: number) => {
        switch (delay) {
            case 1: return 'Rải ngắn'
            case 2: return 'Tiêu chuẩn'
            case 3: return 'Rải dài'
            case 0:
            default: return 'Không rải'
        }
    }

    const handleNavigate = (path: string) => {
        router.push(path)
    }

    const handleOpenForm = (url: string) => {
        window.open(url, '_blank', 'noopener,noreferrer')
    }

    return (
        <section className="py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* User Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h5 className="text-lg font-medium">Xin chào</h5>
                    <h1 className="text-2xl font-bold">{me?.data?.username}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <h4><span className="font-bold">Email: </span>{me?.data?.email}</h4>
                        <h4><span className="font-bold">Số dư: </span>{me?.data?.credit} VND</h4>
                    </div>
                    <button
                        onClick={() => handleNavigate('/form/create')}
                        className="mt-4 w-full block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <h5>BẮT ĐẦU NGAY</h5>
                    </button>
                </div>

                {/* Forms Table */}
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
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2">{form.name}</td>
                                                <td className="px-4 py-2">{new Date(form.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">
                                                    <button
                                                        onClick={() => handleNavigate(`/form/fill/${form.id}`)}
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

                {/* Orders Table */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h2 className="text-xl font-bold mb-4">Tất cả Order</h2>
                    {dataOrder?.data?.orders && dataOrder?.data?.orders.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-2 text-left">#</th>
                                            <th className="px-4 py-2 text-left">Tên Form</th>
                                            <th className="px-4 py-2 text-left min-w-[120px]">Số lượng</th>
                                            <th className="px-4 py-2 text-left min-w-[160px]">Loại</th>
                                            <th className="px-4 py-2 text-left min-w-[160px]">Điền rải</th>
                                            <th className="px-4 py-2 text-left min-w-[160px]">Ngày tạo</th>
                                            <th className="px-4 py-2 text-left">Trạng thái</th>
                                            <th className="px-4 py-2 text-left min-w-[160px]">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataOrder?.data?.orders?.map((order, index) => (
                                            <tr key={order.id} className="border-t">
                                                <td className="px-4 py-2">{index + 1}</td>
                                                <td className="px-4 py-2">{order.name}</td>
                                                <td className="px-4 py-2">{order.num}</td>
                                                <td className="px-4 py-2">{order.type}</td>
                                                <td className="px-4 py-2">{getDelayText(order.delay)}</td>
                                                <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-2">{order.status}</td>
                                                <td className="px-4 py-2 space-x-2">
                                                    {order.status === ORDER_STATUS.RUNNING ? (
                                                        <button
                                                            onClick={() => handleNavigate(`/order/pause/${order.id}`)}
                                                            className="inline-flex items-center p-2 text-red-600 hover:bg-red-50 rounded"
                                                            title="Tạm dừng"
                                                        >
                                                            <span className="sr-only">Tạm dừng</span>
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16 8A8 8 0 110 8a8 8 0 0116 0zM6.75 5.5a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75zm6.5 0a.75.75 0 01.75.75v7.5a.75.75 0 01-1.5 0v-7.5a.75.75 0 01.75-.75z" />
                                                            </svg>
                                                        </button>
                                                    ) : order.status === ORDER_STATUS.PAUSE ? (
                                                        <button
                                                            onClick={() => handleNavigate(`/order/continue/${order.id}`)}
                                                            className="inline-flex items-center p-2 text-green-600 hover:bg-green-50 rounded"
                                                            title="Tiếp tục chạy"
                                                        >
                                                            <span className="sr-only">Tiếp tục</span>
                                                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                            </svg>
                                                        </button>
                                                    ) : null}
                                                    <button
                                                        onClick={() => handleNavigate(`/order/detail/${order.id}`)}
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
                                                        onClick={() => handleOpenForm(order.url)}
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
                        </>
                    ) : (
                        <p className="text-gray-500">Hiện bạn chưa tạo Order nào trên hệ thống</p>
                    )}
                </div>
            </div>
        </section>
    )
}