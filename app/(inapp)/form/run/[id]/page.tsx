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
import { CreateOrderForm } from '@/components/form';

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
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 sm:mt-12">
                    <div className="p-4">
                        {(isLoading || isLoadingForm) ? <LoadingAbsolute /> : <></>}
                        <form onSubmit={handleSubmit}>
                            <CreateOrderForm
                                userCredit={me.data?.credit || 0}
                                numRequest={parseInt(numRequest) || 0}
                                delayType={parseInt(delayType) || 0}
                                formId={formData?.form.id}
                                formName={formData?.form.name}
                                bankInfo={bankInfo}
                                onNumRequestChange={(value) => setNumRequest(value.toString())}
                                onDelayTypeChange={(value) => setDelayType(value.toString())}
                                className="max-w-full"
                            />
                            <div className="mt-6">
                                <button
                                    className={`bg-blue-600 hover:bg-blue-700 text-white w-full py-2 px-4 rounded ${submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={submitDisabled}
                                >
                                    Bắt đầu điền form
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}