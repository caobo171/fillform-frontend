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


    const [numRequest, setNumRequest] = useState('');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [delayType, setDelayType] = useState('0');


    const [submitDisabled, setSubmitDisabled] = useState(false);
    const router = useRouter();

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
                form_id: formData?.form.id,
                disabled_days: disabledDays.join(','),
                schedule_enabled: scheduleEnabled ? 1 : 0,
                start_time: startTime,
                end_time: endTime,
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
        <section id="about" className="bg-gradient-to-b from-primary-50 to-white py-10 mx-auto px-4 sm:px-6">
            <div className="container mx-auto text-center min-h-screen" data-aos="fade-up">
                <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6 sm:mt-12 border border-gray-100">
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
                                disabledDays={disabledDays}
                                scheduleEnabled={scheduleEnabled}
                                startTime={startTime}
                                endTime={endTime}
                                onNumRequestChange={(value) => setNumRequest(value.toString())}
                                onDelayTypeChange={(value) => setDelayType(value.toString())}
                                onScheduleEnabledChange={(value) => setScheduleEnabled(value)}
                                onStartTimeChange={(value) => setStartTime(value)}
                                onEndTimeChange={(value) => setEndTime(value)}
                                onDisabledDaysChange={(value) => setDisabledDays(value)}
                                className="max-w-full"
                            />
                            <div className="mt-6">
                                <button
                                    className={`bg-primary-600 hover:bg-primary-700 text-white w-full py-3 px-4 rounded-md font-bold focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all ${submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    type="submit"
                                    disabled={submitDisabled}
                                >
                                    <div className="flex items-center justify-center">
                                        <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        Bắt đầu điền form
                                    </div>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}