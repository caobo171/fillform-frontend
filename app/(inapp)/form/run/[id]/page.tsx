'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useFormById } from '@/hooks/form';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawForm } from '@/store/types';
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import { useMe, useMyBankInfo } from '@/hooks/user';
import LoadingAbsolute from '@/components/loading';
import { usePostHog } from 'posthog-js/react';
import { PaymentInformation } from '@/components/common';

export default function FormRateOrder() {
    const params = useParams();
    const { data: formData, isLoading: isLoadingForm } = useFormById(params.id as string);
    const [isLoading, setIsLoading] = useState(false);
    const me = useMe();
    const bankInfo = useMyBankInfo();

    const posthog = usePostHog();

    const [numRequest, setNumRequest] = useState('');
    const [delayType, setDelayType] = useState('0');
    const [total, setTotal] = useState(0);
    const [message, setMessage] = useState('');
    const [delayMessage, setDelayMessage] = useState('');

    const pricePerAnswer = useMemo(() => {
        if (delayType == OPTIONS_DELAY_ENUM.SHORT_DELAY.toString()) return OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price;
        else if (delayType == OPTIONS_DELAY_ENUM.STANDARD_DELAY.toString()) return OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price;
        else if (delayType == OPTIONS_DELAY_ENUM.LONG_DELAY.toString()) return OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price;
        else return OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
    }, [delayType]);
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const router = useRouter();

    // Estimate end time function
    const estimateEndTime = (num: number, delayType: number) => {
        let now = new Date();
        now.setUTCHours(now.getUTCHours() + 7); // Convert to GMT+7
        let minutesToAdd = 0;

        if (delayType == 1) minutesToAdd = num * 3;
        else if (delayType == 2) minutesToAdd = num * 7;
        else if (delayType == 3) minutesToAdd = num * 12;

        // Get current hours & minutes in GMT+7
        let currentHours = now.getHours();
        let currentMinutes = now.getMinutes();

        // If outside working hours (before 9am or after 9pm), set to 9:00 next day
        if (currentHours < 9) {
            now.setHours(9, 0, 0, 0);
        } else if (currentHours >= 21) {
            now.setDate(now.getDate() + 1);
            now.setHours(9, 0, 0, 0);
        }

        // Loop to add minutes, only keep within 9:00 - 21:00
        while (minutesToAdd > 0) {
            let remainingMinutesToday = (21 * 60) - (now.getHours() * 60 + now.getMinutes()); // Minutes left in day

            if (minutesToAdd <= remainingMinutesToday) {
                now.setMinutes(now.getMinutes() + minutesToAdd);
                break;
            } else {
                minutesToAdd -= remainingMinutesToday;
                now.setDate(now.getDate() + 1);
                now.setHours(9, 0, 0, 0);
            }
        }

        return `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
    };

    // Update total and messages
    useEffect(() => {
        const numRequestValue = parseInt(numRequest) || 0;
        const delayValue = parseInt(delayType);
        const userCredit = me.data?.credit || 0;

        // Calculate total cost
        const totalCost = numRequestValue * pricePerAnswer;
        setTotal(totalCost);

        // Check balance
        if (totalCost > userCredit) {
            setMessage("❌ KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ!");
            setSubmitDisabled(true);
        } else {
            setSubmitDisabled(false);
            setMessage(`Bạn xác nhận sẽ buff ${numRequestValue} câu trả lời cho form này.`);
        }

        // Display message based on delay type
        let delayNote = '';
        switch (delayValue) {
            case 0:
                delayNote = `Không có điền rải dãn cách. Đơn giá ${pricePerAnswer} VND / 1 mẫu trả lời. Kết quả lên ngay tức thì.`;
                break;
            case 1:
                const estimateTime1 = estimateEndTime(numRequestValue, 1);
                delayNote = `Bill điền rải ngắn có đơn giá ${pricePerAnswer} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 5 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 2 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            case 2:
                const estimateTime2 = estimateEndTime(numRequestValue, 2);
                delayNote = `Bill điền rải tiêu chuẩn có đơn giá ${pricePerAnswer} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 10 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 12 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            case 3:
                const estimateTime3 = estimateEndTime(numRequestValue, 3);
                delayNote = `Bill điền rải dài có đơn giá ${pricePerAnswer} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 20 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 24 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            default:
                delayNote = "⚠️ Lựa chọn điền rải không hợp lệ!";
        }
        setDelayMessage(delayNote);
    }, [numRequest, delayType, pricePerAnswer, me.data?.credit]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setSubmitDisabled(true);
        try {

            const response = await Fetch.postWithAccessToken<{
                code: number;
                message: string;
                form: RawForm;
            }>(`/api/order/create.run`, {
                num_request: numRequest,
                delay_type: delayType,
                form_id: formData?.form.id
            })


            if (response.data?.code == Code.SUCCESS) {
                Toast.success('Đã tạo yêu cầu điền form thành công!');
                router.push(`/`);

                const win = window as any;
                //@ts-ignore
                if (win.PulseSurvey.surveyIgnored('My5wdWxzZXN1cnZleXM')) {
                    console.log('User has ignored the survey');
                } else if (win.PulseSurvey.surveyResponded('My5wdWxzZXN1cnZleXM')) {
                    console.log('User has answered the survey');
                } else {
                    // You can call to show survey directly
                    win.PulseSurvey.showSurvey('My5wdWxzZXN1cnZleXM');
                }
            } else {
                Toast.error(response.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
                console.error('Form submission failed');
            }
        } catch (error) {
            setIsLoading(false);
            Toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
            console.error('Error submitting form:', error);
        } finally {
            setIsLoading(false);

        }

        setSubmitDisabled(false);
    };

    return (
        <section id="about" className="py-10">
            <div className="container mx-auto text-center min-h-screen">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mt-12">
                    <div className="p-4">
                        {(isLoading || isLoadingForm) ? <LoadingAbsolute /> : <></>}
                        <h3 className="text-2xl font-bold mb-2">TẠO YÊU CẦU ĐIỀN FORM</h3>
                        <h6 className="text-sm text-gray-500 mb-4">{formData?.form.name}</h6>
                        <form onSubmit={handleSubmit}>
                            <div className="text-left">
                                <div className="mb-4 grid grid-cols-12 items-center">
                                    <label htmlFor="credit" className="col-span-8 lg:col-span-6">Số dư tài khoản</label>
                                    <div className="col-span-4 lg:col-span-6">
                                        <input type="text" readOnly className="bg-transparent w-full" id="credit" value={me.data?.credit.toLocaleString() + ' VND'} />
                                    </div>
                                </div>
                                <div className="mb-4 grid grid-cols-12 items-center">
                                    <label htmlFor="price" className="col-span-8 lg:col-span-6">Đơn giá mỗi câu trả lời (VND)</label>
                                    <div className="col-span-4 lg:col-span-6">
                                        <p id="pricePerAnswer">{pricePerAnswer.toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="mb-4 grid grid-cols-12 items-center">
                                    <label htmlFor="num_request" className="col-span-8 lg:col-span-6">Số lượng câu trả lời cần tăng</label>
                                    <div className="col-span-4 lg:col-span-6">
                                        <input
                                            type="number"
                                            required
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            id="num_request"
                                            name="num_request"
                                            value={numRequest}
                                            onChange={(e) => setNumRequest(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="mb-4 grid grid-cols-12 items-center">
                                    <label htmlFor="delay" className="col-span-8 lg:col-span-6">Điền rải random như người thật</label>
                                    <div className="col-span-4 lg:col-span-6">
                                        <select
                                            className="w-full border border-gray-300 rounded px-3 py-2"
                                            name="delay"
                                            id="delay"
                                            value={delayType}
                                            onChange={(e) => setDelayType(e.target.value)}
                                        >
                                            {Object.keys(OPTIONS_DELAY).map(e => parseInt(e)).map((key: number) => (
                                                <option key={key} value={key}>
                                                    {OPTIONS_DELAY[key].name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 my-6">
                                <h3 className="text-xl font-bold">TỔNG CỘNG : {total.toLocaleString()} VND</h3>
                                <p className="text-sm text-left w-full" dangerouslySetInnerHTML={{ __html: delayMessage }}></p>
                                
                                {total > (me.data?.credit || 0) && (
                                    <div className="mt-4 p-4 bg-white rounded-lg">
                                        <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-medium">
                                            ❌ KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ!
                                        </div>
                                        <h4 className="text-lg font-bold mb-3 text-center">Nạp thêm {(total - (me.data?.credit || 0)).toLocaleString()} VND để tiếp tục</h4>
                                        
                                        <PaymentInformation 
                                            bankInfo={bankInfo} 
                                            showCopyButtons={false} 
                                            className="space-y-3"
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="grid gap-4">
                                <button
                                    className={`bg-blue-600 hover:bg-blue-700 text-white w-full py-2 px-4 rounded ${submitDisabled ? 'hidden' : ''}`}
                                    type="submit"
                                    id="button-addon1"
                                    disabled={submitDisabled}
                                >
                                    Bắt đầu điền form
                                </button>
                                <Link
                                    href={`/form/${formData?.form.id}`}
                                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded text-center w-full"
                                >
                                    Quay lại
                                </Link>

                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}