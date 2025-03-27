'use client';

import { useState, useEffect, useRef, Fragment } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import Pagination from '@/components/common/Pagination';
import Loading from '@/components/loading';

// Types
interface User {
    _id: string;
    email: string;
    username: string;
    idcredit: string;
    credit: number;
}

interface Form {
    _id: string;
    name: string;
    createdAt: string;
}

interface Order {
    _id: string;
    name: string;
    num: number;
    type: string;
    delay: number;
    createdAt: string;
    status: string;
    url: string;
}

// Mock API calls - Replace with your actual API calls
const fetchUserById = async (userId: string): Promise<User> => {
    // Simulate API call
    return {
        _id: userId,
        email: 'user@example.com',
        username: 'username',
        idcredit: 'ID12345',
        credit: 100000
    };
};

const fetchFormsByUserId = async (userId: string, page: number, pageSize: number): Promise<{
    forms: Form[];
    totalPages: number;
}> => {
    // Simulate API call
    const totalItems = 23;
    const totalPages = Math.ceil(totalItems / pageSize);

    const forms = Array.from({ length: Math.min(pageSize, totalItems - (page - 1) * pageSize) }, (_, i) => ({
        _id: `form-${(page - 1) * pageSize + i + 1}`,
        name: `Test Form ${(page - 1) * pageSize + i + 1}`,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    }));

    return { forms, totalPages };
};

// Utility function to format date
const formatDatetime = (dateString: string): string => {
    if (!dateString) return '';

    const date = new Date(dateString);

    // Check if the date is valid
    if (isNaN(date.getTime())) return '';

    return new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
};

// Main Dashboard Page
export default function UserDashboardPage({ params }: { params: { userId: string } }) {
    const userId = params.userId;
    const router = useRouter();
    const searchParams = useSearchParams();
    const PAGE_SIZE = 10;

    // States
    const [user, setUser] = useState<User | null>(null);
    const [forms, setForms] = useState<Form[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [formsPage, setFormsPage] = useState(1);
    const [ordersPage, setOrdersPage] = useState(1);
    const [totalFormPages, setTotalFormPages] = useState(1);
    const [totalOrderPages, setTotalOrderPages] = useState(1);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [formToDelete, setFormToDelete] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);

    // Refs
    const cancelButtonRef = useRef(null);

    // Effect to get parameters from URL
    useEffect(() => {
        const formsPageParam = searchParams.get('formsPage');
        const ordersPageParam = searchParams.get('ordersPage');
        const msgParam = searchParams.get('msg');

        if (formsPageParam) {
            setFormsPage(Number(formsPageParam));
        }

        if (ordersPageParam) {
            setOrdersPage(Number(ordersPageParam));
        }

        if (msgParam) {
            setMessage(msgParam);
        }
    }, [searchParams]);

    // Effect to fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await fetchUserById(userId);
                setUser(userData);
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, [userId]);

    // Effect to fetch forms
    useEffect(() => {
        const fetchForms = async () => {
            try {
                setIsLoading(true);
                const { forms, totalPages } = await fetchFormsByUserId(userId, formsPage, PAGE_SIZE);
                setForms(forms);
                setTotalFormPages(totalPages);
            } catch (error) {
                console.error('Error fetching forms:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchForms();
    }, [userId, formsPage]);

    // Effect to fetch orders
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const { orders, totalPages } = {orders: [], totalPages: 1}
                setOrders(orders);
                setTotalOrderPages(totalPages);
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [userId, ordersPage]);

    // Handler functions
    const handleFormPageChange = (page: number) => {
        setFormsPage(page);
        updateUrl(page, ordersPage);
    };

    const handleOrderPageChange = (page: number) => {
        setOrdersPage(page);
        updateUrl(formsPage, page);
    };

    const updateUrl = (formsPage: number, ordersPage: number) => {
        const params = new URLSearchParams();
        params.set('formsPage', formsPage.toString());
        params.set('ordersPage', ordersPage.toString());
        if (message) params.set('msg', message);

        router.push(`/admin/dashboard/${userId}?${params.toString()}`);
    };

    const confirmDelete = (formId: string) => {
        setFormToDelete(formId);
        setShowModal(true);
    };

    const handleDelete = async () => {
        if (!formToDelete) return;

        try {
            // Call your delete API here
            // await deleteForm(formToDelete);
            console.log(`Deleting form: ${formToDelete}`);

            // Reload the current page of forms
            const { forms, totalPages } = await fetchFormsByUserId(userId, formsPage, PAGE_SIZE);
            setForms(forms);
            setTotalFormPages(totalPages);

            // Show success message
            setMessage('Form deleted successfully');
        } catch (error) {
            console.error('Error deleting form:', error);
            setMessage('Error deleting form');
        } finally {
            setShowModal(false);
            setFormToDelete(null);
        }
    };

    const getDelayText = (delay: number | null) => {
        switch (delay) {
            case 1: return 'Rải ngắn';
            case 2: return 'Tiêu chuẩn';
            case 3: return 'Rải dài';
            case 0:
            case null:
            default: return 'Không rải';
        }
    };

    if (!user) {
        return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
    }

    return (
        <section className="py-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div className="w-full md:w-1/2">
                        <h4 className="text-lg mb-2">
                            <span className="font-bold w-24 inline-block">Email:</span> {user.email}
                        </h4>
                        <h4 className="text-lg mb-2">
                            <span className="font-bold w-24 inline-block">Username:</span> {user.username}
                        </h4>
                        <h4 className="text-lg mb-2">
                            <span className="font-bold w-24 inline-block">IDCredit:</span> {user.idcredit}
                        </h4>
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col items-start md:items-end">
                        <h4 className="text-lg mb-4">
                            <span className="font-bold">Số dư:</span> {user.credit.toLocaleString()} VND
                        </h4>
                        <Link
                            href={`/admin/credit/${user._id}`}
                            className="w-full md:w-auto px-4 py-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition text-center"
                        >
                            Thêm Credit
                        </Link>
                    </div>
                </div>

                {message && (
                    <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-8" role="alert">
                        <p>{message}</p>
                    </div>
                )}

                {/* Forms Section */}
                <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Tất cả Dữ liệu Form</h2>

                    {isLoading ? (
                        <Loading />
                    ) : forms.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="w-16 py-3 px-4 text-left">#</th>
                                            <th className="py-3 px-4 text-left">Tên Form</th>
                                            <th className="py-3 px-4 text-left">Ngày tạo</th>
                                            <th className="py-3 px-4 text-left">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {forms.map((form, index) => (
                                            <tr key={form._id} className="hover:bg-gray-50 border-b">
                                                <td className="py-3 px-4">{(formsPage - 1) * PAGE_SIZE + index + 1}</td>
                                                <td className="py-3 px-4">{form.name}</td>
                                                <td className="py-3 px-4">{formatDatetime(form.createdAt)}</td>
                                                <td className="py-3 px-4">
                                                    <div className="flex space-x-2">
                                                        <Link
                                                            href={`/admin/form/${form._id}`}
                                                            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition text-sm"
                                                        >
                                                            Chi tiết
                                                        </Link>
                                                        <button
                                                            onClick={() => confirmDelete(form._id)}
                                                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                                                        >
                                                            Xóa form
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalFormPages > 1 && (
                                <Pagination
                                    current={formsPage}
                                    total={totalFormPages}
                                    onChange={handleFormPageChange}
                                    className="mt-4"
                                    pageSize={PAGE_SIZE}
                                />
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 italic">Hiện bạn chưa tạo form nào trên hệ thống</p>
                    )}
                </div>

                {/* Orders Section */}
                <div>
                    <h2 className="text-2xl font-bold mb-4">Tất cả Order</h2>

                    {isLoading ? (
                        <div className="text-center py-4">Loading...</div>
                    ) : orders.length > 0 ? (
                        <>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="w-12 py-3 px-2 text-left">#</th>
                                            <th className="py-3 px-2 text-left">Tên Form</th>
                                            <th className="py-3 px-2 text-left">Số lượng</th>
                                            <th className="py-3 px-2 text-left">Loại</th>
                                            <th className="py-3 px-2 text-left">Điền rải</th>
                                            <th className="py-3 px-2 text-left">Ngày tạo</th>
                                            <th className="py-3 px-2 text-left">Trạng thái</th>
                                            <th className="py-3 px-2 text-left">Hành động</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {orders.map((order, index) => (
                                            <tr key={order._id} className="hover:bg-gray-50 border-b">
                                                <td className="py-3 px-2">{(ordersPage - 1) * PAGE_SIZE + index + 1}</td>
                                                <td className="py-3 px-2">{order.name}</td>
                                                <td className="py-3 px-2">{order.num}</td>
                                                <td className="py-3 px-2">{order.type}</td>
                                                <td className="py-3 px-2">{getDelayText(order.delay)}</td>
                                                <td className="py-3 px-2">{formatDatetime(order.createdAt)}</td>
                                                <td className="py-3 px-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'Hoàn thành' ? 'bg-green-100 text-green-800' :
                                                            order.status === 'Đang chạy' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-yellow-100 text-yellow-800'
                                                        }`}>
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2">
                                                    <div className="flex space-x-1">
                                                        {order.status === 'Hoàn thành' ? (
                                                            <button
                                                                disabled
                                                                className="p-1 bg-gray-200 text-gray-500 rounded opacity-50 cursor-not-allowed"
                                                                title="Hoàn thành"
                                                            >
                                                                P
                                                            </button>
                                                        ) : order.status === 'Đang chạy' ? (
                                                            <Link
                                                                href={`/admin/order/pause/${order._id}`}
                                                                className="p-1 bg-red-100 text-red-700 hover:bg-red-200 rounded"
                                                                title="Tạm dừng"
                                                            >
                                                                P
                                                            </Link>
                                                        ) : (
                                                            <Link
                                                                href={`/admin/order/continue/${order._id}`}
                                                                className="p-1 bg-green-100 text-green-700 hover:bg-green-200 rounded"
                                                                title="Tiếp tục chạy"
                                                            >
                                                                P
                                                            </Link>
                                                        )}
                                                        <Link
                                                            href={`/admin/order/${order._id}`}
                                                            className="p-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                                                            title="Xem chi tiết"
                                                        >
                                                            V
                                                        </Link>
                                                        <Link
                                                            href={order.url}
                                                            className="p-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
                                                            title="Xem Form"
                                                        >
                                                            F
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {totalOrderPages > 1 && (
                                <Pagination
                                    current={ordersPage}
                                    total={totalOrderPages}
                                    onChange={handleOrderPageChange}
                                    className="mt-4"
                                    pageSize={PAGE_SIZE}
                                />
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 italic">Hiện bạn chưa tạo Order nào trên hệ thống</p>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            <Transition.Root show={showModal} as={Fragment}>
                <Dialog as="div" className="relative z-10" initialFocus={cancelButtonRef} onClose={() => setShowModal(false)}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-10 overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                                enterTo="opacity-100 translate-y-0 sm:scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            >
                                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                        <div className="sm:flex sm:items-start">
                                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                            </div>
                                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                                                    Xác nhận xóa
                                                </Dialog.Title>
                                                <div className="mt-2">
                                                    <p className="text-sm text-gray-500">
                                                        Bạn có chắc chắn muốn xóa form này không?
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={handleDelete}
                                        >
                                            Xóa
                                        </button>
                                        <button
                                            type="button"
                                            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                            onClick={() => setShowModal(false)}
                                            ref={cancelButtonRef}
                                        >
                                            Hủy
                                        </button>
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>
        </section>
    );
}