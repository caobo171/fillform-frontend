'use client'

import LoadingAbsolute, { Loading } from '@/components/loading'
import Constants, { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM, ORDER_STATUS, ORDER_TYPE } from '@/core/Constants'
import { useFormById } from '@/hooks/form'
import { useOrderById } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import Fetch from '@/lib/core/fetch/Fetch'
import { Helper } from '@/services/Helper'
import { SocketService } from '@/services/SocketClient'
import { Toast } from '@/services/Toast'
import { RawOrder } from '@/store/types'
import { useParams } from 'next/navigation'
import { FC, useState, useMemo, useEffect, useRef } from 'react'
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
    const [scheduleEnabled, setScheduleEnabled] = useState(Boolean(order.data?.order.schedule_setup?.enabled));
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [daysDropdownOpen, setDaysDropdownOpen] = useState<boolean>(false);
    const daysDropdownRef = useRef<HTMLDivElement>(null);

    // SPECIFIC_DELAY state
    const [specificStartDate, setSpecificStartDate] = useState(order.data?.order.specific_delay?.start_date || '');
    const [specificEndDate, setSpecificEndDate] = useState(order.data?.order.specific_delay?.end_date || '');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>(order.data?.order.specific_delay?.daily_schedules || []);
    const [startDateWarning, setStartDateWarning] = useState('');
    const [endDateWarning, setEndDateWarning] = useState('');
    const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);

    useEffect(() => {
        setOwner(order.data?.order.owner)
        setDelay(order.data?.order.delay)
        setScheduleEnabled(Boolean(order.data?.order.schedule_setup?.enabled))

        if (order.data?.order.delay == OPTIONS_DELAY_ENUM.SPECIFIC_DELAY) { // SPECIFIC_DELAY
            // Load specific delay info from backend if available
            const spec = order.data?.order.specific_delay;
            setSpecificStartDate(spec?.start_date || '');
            setSpecificEndDate(spec?.end_date || '');
            if (spec?.daily_schedules) {
                setSpecificDailySchedules(spec.daily_schedules.map(s => ({
                    date: s.date,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    enabled: !!s.enabled
                })));
            } else if (order.data?.order.schedule_setup?.config) {
                // Fallback: Convert config to daily schedules if present
                const config = order.data.order.schedule_setup.config;
                const schedules = Object.entries(config).map(([date, slots]: [string, any]) => ({
                    date,
                    startTime: slots?.[0]?.[0] || '08:00',
                    endTime: slots?.[0]?.[1] || '20:00',
                    enabled: slots && slots.length > 0
                }));
                setSpecificDailySchedules(schedules);
            }
        } else if (order.data?.order.schedule_setup?.config) {
            // Regular schedule
            const allDays = Object.entries(order.data.order.schedule_setup.config);
            if (allDays.length > 0) {
                for (const [day, slots] of allDays) {
                    if (slots && slots.length > 0 && slots[0].length >= 2) {
                        setStartTime(slots[0][0] || '08:00');
                        setEndTime(slots[0][1] || '20:00');
                        break;
                    }
                }
            }
            // Find disabled days
            const disabledDaysList: number[] = [];
            for (let i = 0; i < 7; i++) {
                const daySlots = order.data.order.schedule_setup.config[i.toString()];
                if (!daySlots || daySlots.length === 0) {
                    disabledDaysList.push(i);
                }
            }
            setDisabledDays(disabledDaysList);
        }
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
            let postData: any = {
                id: params.id as string,
                owner: owner,
                delay: delay,
                schedule_enabled: scheduleEnabled ? 1 : 0,
            };
            if (delay == OPTIONS_DELAY_ENUM.SPECIFIC_DELAY) { // SPECIFIC_DELAY
                postData.specific_start_date = specificStartDate;
                postData.specific_end_date = specificEndDate;
                postData.specific_daily_schedules = specificDailySchedules.map((s: any) => `${s.date}_${s.startTime}_${s.endTime}_${s.enabled}`).join(',');
            } else {
                postData.disabled_days = disabledDays.join(',');
                postData.start_time = startTime;
                postData.end_time = endTime;
            }
            const res = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/update', postData);
            if (res.data.code === Code.SUCCESS) {
                order.mutate();
                Toast.success('Thay đổi đã được lưu');
            } else {
                Toast.error(res.data.message);
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


                // Create throttled version of order.mutate that executes at most once every 5 seconds
                let lastMutateTime = 0;
                const throttledMutate = () => {
                    const now = Date.now();
                    if (now - lastMutateTime >= 5000) { // 5000ms = 5s
                        lastMutateTime = now;
                        order.mutate();
                    } else {
                        console.log('Throttled order.mutate call', now - lastMutateTime, 'ms since last call');
                    }
                };

                SocketService.socket.on('order_running', (data: any) => {
                    console.log('order_running', data);
                    throttledMutate();
                });

                SocketService.socket.on('order_completed', (data: any) => {
                    console.log('order_completed', data);
                    throttledMutate();
                });

                SocketService.socket.on('ai_thinking', (data: any) => {
                    console.log('ai_thinking', data);
                    throttledMutate();
                });

                return () => {
                    SocketService.socket.off('order_running');
                    SocketService.socket.off('order_completed');
                    SocketService.socket.off('ai_thinking');
                }
            })()

        }

    }, [me]);



    if (order.isLoading) {
        return <Loading />
    }


    return (
        <section className="bg-gradient-to-b from-primary-50 to-white py-12 mx-auto px-4 sm:px-6">
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
                                    <span className="font-semibold">{OPTIONS_DELAY[(order.data?.order.delay) as keyof typeof OPTIONS_DELAY]?.name || 'Unknown'}</span>
                                </div>

                                {/* Specific Delay Schedule Display */}
                                {order.data?.order.delay == OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && order.data?.order.specific_delay ? (
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Lịch cụ thể:</span>
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">
                                                <div><span className="font-medium">Bắt đầu:</span> {order.data?.order.specific_delay.start_date ? new Date(order.data?.order.specific_delay.start_date).toLocaleString() : '-'}</div>
                                                <div><span className="font-medium">Kết thúc:</span> {order.data?.order.specific_delay.end_date ? new Date(order.data?.order.specific_delay.end_date).toLocaleString() : '-'}</div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {order.data?.order.specific_delay.daily_schedules && Array.isArray(order.data?.order.specific_delay.daily_schedules) && order.data?.order.specific_delay.daily_schedules.length > 0 ? (
                                                    order.data?.order.specific_delay.daily_schedules.map((sch: any, idx: number) => (
                                                        <div key={idx} className="mb-1">
                                                            <span className="font-medium">{sch.date}: </span>
                                                            {sch.enabled ? (
                                                                <span>{sch.start_time} - {sch.end_time}</span>
                                                            ) : (
                                                                <span className="text-red-400">Không có khung giờ</span>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-red-400">Không có lịch hàng ngày</div>
                                                )}
                                            </div>
                                            {Array.isArray((order.data?.order.specific_delay as any)?.computed_delay_times) ? (
                                                <div className="text-xs text-gray-400 mt-1">Số lần điền đã tính: {(order.data?.order.specific_delay as any).computed_delay_times.length}</div>
                                            ) : null}
                                        </div>
                                    </div>
                                ) : null}

                                {/* Only show Lịch điền if not SPECIFIC_DELAY */}
                                {order.data?.order.delay !== OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && Number(order.data?.order.schedule_setup?.enabled) ? (
                                    <div className="flex justify-between items-start">
                                        <span className="text-gray-600">Lịch điền:</span>
                                        <div className="text-right">
                                            <span className="font-semibold text-green-600">Đã kích hoạt</span>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {Object.entries(order.data?.order.schedule_setup?.config || {}).map(([day, slots]: [string, any]) => {
                                                    if (!slots || slots.length === 0) return null;
                                                    const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
                                                    return (
                                                        <div key={day} className="mb-1">
                                                            <span className="font-medium">{dayNames[parseInt(day)]}: </span>
                                                            {slots.map((slot: any, index: number) => (
                                                                <span key={index}>
                                                                    {slot[0]}-{slot[1]}{index < slots.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                ) : null}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-semibold">{new Date(order.data?.order?.createdAt || '').toLocaleString()}</span>
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
                                        {!order.data?.order.schedule_setup?.enabled && (
                                            <div className="mt-2 text-yellow-600 text-xs italic">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                Order có thể được dừng bởi người dùng, hoặc dừng do không trong thời gian rải đơn (7-22h hằng ngày)
                                            </div>
                                        )}
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



                                {
                                    order.data?.order.type === ORDER_TYPE.AGENT && order.data?.order.ai_result?.status !== 'DONE_AI_THINKING' ? (
                                        <div className="pt-2 border-t border-gray-100 mt-2">
                                            <div className="flex items-center justify-between">
                                                <span className="text-gray-600">AI is thinking</span>
                                                <div className="flex items-center">
                                                    {order.data?.order.createdAt && new Date().getTime() - new Date(order.data.order.createdAt).getTime() > 15 * 60 * 1000 ? (
                                                        <div className="flex items-center">
                                                            <div className="mr-2 h-4 w-4 text-red-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-red-600 italic text-sm">Request may be stuck (waiting &gt;15 min)</span>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="animate-spin mr-2 h-4 w-4 text-primary-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                </svg>
                                                            </div>
                                                            <span className="text-gray-500 italic text-sm">{order.data?.order.ai_result?.status}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null
                                }

                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-gray-600">Dữ liệu Form:</span>
                                        {order.data?.order.data_url ? (
                                            <a
                                                href={order.data.order.data_url}
                                                className="text-primary-600 hover:text-primary-800 font-medium flex items-center"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                                </svg>
                                                Xem bảng dữ liệu
                                            </a>
                                        ) : (
                                            <span className="text-gray-500 italic text-sm">Không có dữ liệu</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="text-left mb-8 bg-white rounded shadow-sm p-6 border border-gray-100">
                        <h2 className="text-2xl font-bold mb-4">Quản lý Order</h2>

                        {
                            order.data?.order.status == ORDER_STATUS.CANCELED ? <>
                                <div className="p-3 bg-red-50 text-red-800 rounded mb-4 text-sm">
                                    <p>⚠️ Order đã bị hủy</p>
                                </div>
                            </> : (<>
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
                                        Huỷ
                                    </button>
                                    <button
                                        onClick={() => orderClone()}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                                    >
                                        Clone
                                    </button>
                                </div>

                            </>)
                        }



                        {
                            order.data?.order.status === ORDER_STATUS.PAUSE ? (

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
                                                onChange={(e) => setDelay(Number(e.target.value))}
                                                className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                            >
                                                {
                                                    Object.keys(OPTIONS_DELAY).map((delay, index) => (
                                                        <option key={index} value={delay}>{OPTIONS_DELAY[Number(delay)].name}</option>
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

                                    {/* Schedule Setup Section */}
                                    <div className="sm:col-span-6 mt-4 border-t pt-6">
                                        <h3 className="text-lg font-semibold mb-4">Đặt giờ chạy</h3>

                                        {/* SPECIFIC_DELAY schedule controls */}
                                        {delay == OPTIONS_DELAY_ENUM.SPECIFIC_DELAY ? (
                                            <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50">
                                                <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="specific-start-date" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu:</label>
                                                        <input
                                                            type="date"
                                                            id="specific-start-date"
                                                            value={specificStartDate}
                                                            onChange={e => setSpecificStartDate(e.target.value)}
                                                            className={`w-full border ${startDateWarning ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                                                        />
                                                        {startDateWarning && (
                                                            <p className="text-red-500 text-xs mt-1">{startDateWarning}</p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label htmlFor="specific-end-date" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (tối đa 7 ngày):</label>
                                                        <input
                                                            type="date"
                                                            id="specific-end-date"
                                                            value={specificEndDate}
                                                            onChange={e => setSpecificEndDate(e.target.value)}
                                                            className={`w-full border ${endDateWarning ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                                                        />
                                                        {endDateWarning && (
                                                            <p className="text-red-500 text-xs mt-1">{endDateWarning}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mb-2">
                                                    <h5 className="font-medium text-gray-700 mb-2">Đặt giờ chạy theo ngày:</h5>
                                                    {isGeneratingSchedules ? (
                                                        <div className="text-center py-4">
                                                            <p className="text-gray-500">Đang tạo lịch trình...</p>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                                                            {specificDailySchedules.map((schedule, index) => {
                                                                const date = new Date(schedule.date);
                                                                const isFirstDay = index === 0;
                                                                const isLastDay = index === specificDailySchedules.length - 1;
                                                                const formattedDate = date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
                                                                return (
                                                                    <div key={schedule.date} className="border border-gray-200 rounded-lg p-3 bg-white">
                                                                        <div className="flex items-center justify-between mb-2">
                                                                            <div className="font-medium">{formattedDate}</div>
                                                                            <div className="flex items-center">
                                                                                <input
                                                                                    type="checkbox"
                                                                                    id={`day-enabled-${index}`}
                                                                                    checked={schedule.enabled}
                                                                                    onChange={e => {
                                                                                        const updated = [...specificDailySchedules];
                                                                                        updated[index] = { ...updated[index], enabled: e.target.checked };
                                                                                        setSpecificDailySchedules(updated);
                                                                                    }}
                                                                                    className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded"
                                                                                />
                                                                                <label htmlFor={`day-enabled-${index}`} className="ml-2 text-sm text-gray-700">Bật</label>
                                                                            </div>
                                                                        </div>
                                                                        {schedule.enabled && (
                                                                            <div className="grid grid-cols-2 gap-3">
                                                                                <div>
                                                                                    <label htmlFor={`day-start-${index}`} className="block text-xs text-gray-500 mb-1">Bắt đầu</label>
                                                                                    <input
                                                                                        type="time"
                                                                                        id={`day-start-${index}`}
                                                                                        value={schedule.startTime}
                                                                                        onChange={e => {
                                                                                            const updated = [...specificDailySchedules];
                                                                                            updated[index] = { ...updated[index], startTime: e.target.value };
                                                                                            setSpecificDailySchedules(updated);
                                                                                        }}
                                                                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                                    />
                                                                                    {isFirstDay && <p className="text-xs text-gray-500 mt-1">Ngày đầu tiên</p>}
                                                                                </div>
                                                                                <div>
                                                                                    <label htmlFor={`day-end-${index}`} className="block text-xs text-gray-500 mb-1">Kết thúc</label>
                                                                                    <input
                                                                                        type="time"
                                                                                        id={`day-end-${index}`}
                                                                                        value={schedule.endTime}
                                                                                        onChange={e => {
                                                                                            const updated = [...specificDailySchedules];
                                                                                            updated[index] = { ...updated[index], endTime: e.target.value };
                                                                                            setSpecificDailySchedules(updated);
                                                                                        }}
                                                                                        className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                                                                                    />
                                                                                    {isLastDay && <p className="text-xs text-gray-500 mt-1">Ngày cuối cùng</p>}
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            // Regular schedule controls (existing UI)
                                            <>
                                                <div className="mb-4">
                                                    <div
                                                        className="flex items-center"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setScheduleEnabled(!scheduleEnabled);
                                                        }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            id="schedule-enabled"
                                                            checked={scheduleEnabled}
                                                            onChange={(e) => {
                                                                e.stopPropagation(); // Prevent event bubbling
                                                                setScheduleEnabled(!scheduleEnabled);
                                                            }}
                                                            className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                                                        />
                                                        <label
                                                            htmlFor="schedule-enabled"
                                                            className="ml-2 block text-sm text-gray-700 cursor-pointer"
                                                        >
                                                            Bật lịch trình (+50 VND/yêu cầu)
                                                            {!scheduleEnabled && Number(delay) !== 0 && (
                                                                <span className="block text-xs text-red-500 mt-1 font-sm">
                                                                    Lưu ý: Nếu không bật lịch trình, yêu cầu sẽ tự động dừng từ 22h đến 7h hôm sau
                                                                </span>
                                                            )}
                                                        </label>
                                                    </div>
                                                </div>

                                                {scheduleEnabled && (
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Thời gian chạy trong ngày:</label>
                                                            <div className="flex space-x-2">
                                                                <div className="flex-1">
                                                                    <label htmlFor="start-time" className="block text-xs text-gray-500 mb-1">Từ</label>
                                                                    <input
                                                                        type="time"
                                                                        id="start-time"
                                                                        value={startTime}
                                                                        onChange={(e) => setStartTime(e.target.value)}
                                                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                                                    />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <label htmlFor="end-time" className="block text-xs text-gray-500 mb-1">Đến</label>
                                                                    <input
                                                                        type="time"
                                                                        id="end-time"
                                                                        value={endTime}
                                                                        onChange={(e) => setEndTime(e.target.value)}
                                                                        className="w-full border border-gray-300 rounded px-3 py-2"
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="mb-3">
                                                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày <span className="font-bold text-red-600">KHÔNG</span> chạy trong tuần:</label>
                                                            <div className="relative" ref={daysDropdownRef}>
                                                                <div
                                                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                                                                    onClick={() => setDaysDropdownOpen(!daysDropdownOpen)}
                                                                >
                                                                    <div className="flex justify-between items-center">
                                                                        <span className="truncate font-sm">
                                                                            {disabledDays.length === 0
                                                                                ? 'Chạy tất cả các ngày'
                                                                                : disabledDays
                                                                                    .map(day => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day])
                                                                                    .join(', ')}
                                                                        </span>
                                                                        <svg className="flex-shrink-0 fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                                                            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                                                                        </svg>
                                                                    </div>
                                                                </div>
                                                                {daysDropdownOpen && (
                                                                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                                                                        {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                                                            const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                                                                            const isSelected = disabledDays.includes(day);
                                                                            return (
                                                                                <div
                                                                                    key={day}
                                                                                    className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center ${isSelected ? 'bg-blue-50' : ''}`}
                                                                                    onClick={() => {
                                                                                        const newDisabledDays = isSelected
                                                                                            ? disabledDays.filter(d => d !== day)
                                                                                            : [...disabledDays, day];
                                                                                        setDisabledDays(newDisabledDays);
                                                                                    }}
                                                                                >
                                                                                    <input
                                                                                        type="checkbox"
                                                                                        checked={isSelected}
                                                                                        onChange={() => { }}
                                                                                        className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mr-2"
                                                                                    />
                                                                                    <span>{dayNames[day]}</span>
                                                                                </div>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {scheduleEnabled && (
                                                            <div className="sm:col-span-2 bg-white rounded-lg p-3 mb-3 border border-green-100">
                                                                <h4 className="font-sm text-green-700 mb-2">Lịch trình đã bật:</h4>
                                                                <ul className="text-sm text-gray-700 space-y-1">
                                                                    <li>• Thời gian chạy: <span className="font-sm">{startTime} - {endTime}</span> mỗi ngày</li>
                                                                    {disabledDays.length > 0 && (
                                                                        <li>• Không chạy vào: <span className="font-sm">
                                                                            {disabledDays
                                                                                .map(day => ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day])
                                                                                .join(', ')}
                                                                        </span></li>
                                                                    )}
                                                                    <li>• Phụ phí: <span className="font-sm text-green-600">+50 VND/yêu cầu</span></li>
                                                                </ul>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </>
                                        )}
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

                    <>
                        {
                            order.data?.order.type == ORDER_TYPE.AGENT && (
                                <>
                                    <h2 className="text-2xl font-bold mb-4">Cấu hình AI Agent</h2>

                                    <div className="bg-white p-6 rounded-lg border border-gray-100 mb-6">
                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Kết quả nhân khẩu học mong muốn</h3>
                                            <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
                                                {order.data?.order.config_data?.demographic_goal || 'Không có thông tin'}
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <h3 className="text-lg font-semibold mb-2">Kết quả về dữ liệu mong muốn</h3>
                                            <div className="p-4 bg-gray-50 rounded whitespace-pre-wrap">
                                                {order.data?.order.config_data?.spss_goal || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>

                                    {order.data?.order.ai_result && (
                                        <div className="bg-white p-6 rounded-lg border border-gray-100">
                                            <h3 className="text-xl font-bold mb-4">Kết quả phân tích</h3>

                                            <div className="p-4 my-3 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md">
                                                <p className="flex items-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    Kết quả báo cáo chỉ là nhận xét sơ bộ về tập dữ liệu, bạn vẫn cần phải chạy lại SPSS để đảm bảo kết quả phân tích chính xác
                                                </p>
                                            </div>

                                            <div className="flex flex-col sm:flex-row gap-4">
                                                {order.data.order.ai_result.data_file && (
                                                    <a
                                                        href={Constants.IMAGE_URL + order.data.order.ai_result.data_file.url}
                                                        download={order.data.order.ai_result.data_file.name || "data.csv"}
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                                                        onClick={(e) => {
                                                            // Force download using Fetch API
                                                            e.preventDefault();
                                                            const url = Constants.IMAGE_URL + (order.data?.order?.ai_result?.data_file?.url || '');
                                                            const filename = order.data?.order?.ai_result?.data_file?.name || "data.csv";

                                                            fetch(url)
                                                                .then(response => response.blob())
                                                                .then(blob => {
                                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.style.display = 'none';
                                                                    a.href = blobUrl;
                                                                    a.download = filename;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    window.URL.revokeObjectURL(blobUrl);
                                                                    document.body.removeChild(a);
                                                                })
                                                                .catch(() => window.open(url, '_blank'));
                                                        }}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        <span>Tải file dữ liệu CSV</span>
                                                    </a>
                                                )}

                                                {order.data.order.ai_result.report_file && (
                                                    <a
                                                        href={Constants.IMAGE_URL + order.data.order.ai_result.report_file.url}
                                                        download={order.data.order.ai_result.report_file.name || "report.pdf"}
                                                        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                                        onClick={(e) => {
                                                            // Force download using Fetch API
                                                            e.preventDefault();
                                                            const url = Constants.IMAGE_URL + (order.data?.order?.ai_result?.report_file?.url || '');
                                                            const filename = order.data?.order?.ai_result?.report_file?.name || "report.pdf";

                                                            fetch(url)
                                                                .then(response => response.blob())
                                                                .then(blob => {
                                                                    const blobUrl = window.URL.createObjectURL(blob);
                                                                    const a = document.createElement('a');
                                                                    a.style.display = 'none';
                                                                    a.href = blobUrl;
                                                                    a.download = filename;
                                                                    document.body.appendChild(a);
                                                                    a.click();
                                                                    window.URL.revokeObjectURL(blobUrl);
                                                                    document.body.removeChild(a);
                                                                })
                                                                .catch(() => window.open(url, '_blank'));
                                                        }}
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                        </svg>
                                                        <span>Tải báo cáo phân tích PDF</span>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </>
                            )
                        }
                    </>

                    <>
                        {
                            order.data?.order.type === ORDER_TYPE.AUTOFILL ? (
                                <>
                                    <h2 className="text-2xl font-bold mb-4">Cấu hình tỉ lệ Form</h2>

                                    <div className="bg-white p-6 rounded-lg border border-gray-100">
                                        {order.data?.order.data.map((question, qIndex) => (
                                            <div key={qIndex} className="p-4 bg-gray-50 rounded shadow-sm text-xs mb-4">
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
                                </>
                            ) : null
                        }

                    </>


                </div>
            </div>
        </section>
    )
}

export default OrderPage