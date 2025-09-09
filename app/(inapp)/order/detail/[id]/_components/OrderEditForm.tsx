'use client'

import LoadingAbsolute from '@/components/loading'
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM, ORDER_STATUS } from '@/core/Constants'
import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import { RawOrder } from '@/store/types'
import { FC, useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import clsx from 'clsx'

interface OrderEditFormProps {
    order: RawOrder;
    mutateOrder: () => void;
}

const OrderEditForm: FC<OrderEditFormProps> = ({ order, mutateOrder }) => {
    const params = useParams();
    const [isFetching, setIsFetching] = useState(false)

    const [owner, setOwner] = useState(order?.owner)
    const [delay, setDelay] = useState(order?.delay);
    const [scheduleEnabled, setScheduleEnabled] = useState(Boolean(order?.schedule_setup?.enabled));
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [daysDropdownOpen, setDaysDropdownOpen] = useState<boolean>(false);
    const daysDropdownRef = useRef<HTMLDivElement>(null);

    // SPECIFIC_DELAY state
    const [specificStartDate, setSpecificStartDate] = useState(order?.specific_delay?.start_date || '');
    const [specificEndDate, setSpecificEndDate] = useState(order?.specific_delay?.end_date || '');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>(order?.specific_delay?.daily_schedules || []);
    const [startDateWarning, setStartDateWarning] = useState('');
    const [endDateWarning, setEndDateWarning] = useState('');
    const [isGeneratingSchedules, setIsGeneratingSchedules] = useState(false);

    useEffect(() => {
        setOwner(order?.owner)
        setDelay(order?.delay)
        setScheduleEnabled(Boolean(order?.schedule_setup?.enabled))

        if (order.delay == OPTIONS_DELAY_ENUM.SPECIFIC_DELAY) { // SPECIFIC_DELAY
            // Load specific delay info from backend if available
            const spec = order.specific_delay;
            setSpecificStartDate(spec?.start_date || '');
            setSpecificEndDate(spec?.end_date || '');
            if (spec?.daily_schedules) {
                setSpecificDailySchedules(spec.daily_schedules.map(s => ({
                    date: s.date,
                    startTime: s.start_time,
                    endTime: s.end_time,
                    enabled: !!s.enabled
                })));
            } else if (order.schedule_setup?.config) {
                // Fallback: Convert config to daily schedules if present
                const config = order.schedule_setup.config;
                const schedules = Object.entries(config).map(([date, slots]: [string, any]) => ({
                    date,
                    startTime: slots?.[0]?.[0] || '08:00',
                    endTime: slots?.[0]?.[1] || '20:00',
                    enabled: slots && slots.length > 0
                }));
                setSpecificDailySchedules(schedules);
            }
        } else if (order.schedule_setup?.config) {
            // Regular schedule
            const allDays = Object.entries(order.schedule_setup.config);
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
                const daySlots = order.schedule_setup.config[i.toString()];
                if (!daySlots || daySlots.length === 0) {
                    disabledDaysList.push(i);
                }
            }
            setDisabledDays(disabledDaysList);
        }
    }, [order])

    const orderContinue = async () => {
        setIsFetching(true)
        try {
            const res = await Fetch.postWithAccessToken<{ code: number }>('/api/order/continue', {
                id: params.id as string
            })

            if (res.data.code === Code.SUCCESS) {
                mutateOrder();
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
                mutateOrder();
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
                mutateOrder();
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
                mutateOrder();
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
                mutateOrder();
                Toast.success('Order đã được tạm dừng');
            }
        } catch (error) {
            Toast.error('Lỗi khi tạm dừng order');
        } finally {
            setIsFetching(false)
        }
    }

    return (
        <div>
            {isFetching ? <LoadingAbsolute /> : <></>}
            {(
                <div className="text-left mb-8 bg-white rounded shadow-sm p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4">Quản lý Order</h2>

                    {
                        order.status == ORDER_STATUS.CANCELED ? <>
                            <div className="p-3 bg-red-50 text-red-800 rounded mb-4 text-sm">
                                <p>⚠️ Order đã bị hủy</p>
                            </div>
                        </> : (<>
                            <div className="p-3 bg-yellow-50 text-yellow-800 rounded mb-4 text-sm">
                                <p>⚠️ Hãy chắc chắn đã ấn <b>Tạm dừng</b> trước khi thực hiện <b>bất cứ thao tác nào</b> với order</p>
                            </div>

                            {/* Admin Controls */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {order.status === ORDER_STATUS.SUCCESS ? (
                                    <button disabled className="px-4 py-2 bg-gray-400 text-white rounded cursor-not-allowed opacity-50">Tiếp tục</button>
                                ) : order.status === ORDER_STATUS.RUNNING ? (
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
                        order.status === ORDER_STATUS.PAUSE ? (

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

                        ) : <></>}
                </div>
            )}
        </div>
    )
}

export default OrderEditForm
