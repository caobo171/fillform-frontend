"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useFormById } from "@/hooks/form";
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM, PULSES_TOKEN } from "@/core/Constants";
import { useMe, useMyBankInfo } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import LoadingAbsolute from '@/components/loading';
import { CreateOrderForm } from "@/components/form";
import { FormTypeNavigation } from "../../../_components/FormTypeNavigation";
import WarningChatBox from "../../../_components/WarningChatBox";
import { Helper } from "@/services/Helper";



interface Field {
    id: string;
    value: string;
}

interface ChatError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'note';
}

export default function PrefillRun() {
    const router = useRouter();
    const { id } = useParams();

    const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(id as string);
    const [isLoading, setIsLoading] = useState(false);
    const [reloadEvent, setReloadEvent] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fields, setFields] = useState<Field[] | null>(null);
    const [prefillForm, setPrefillForm] = useState<any>(null);
    const [prefillData, setPrefillData] = useState<any>({});
    const [urlData, setUrlData] = useState('');
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const { data: user } = useMe();
    const bankInfo = useMyBankInfo();

    const [chatOpen, setChatOpen] = useState<boolean>(true);
    const [chatErrors, setChatErrors] = useState<ChatError[]>([]);
    const [isShowErrorMessage, setIsShowErrorMessage] = useState<boolean>(false);

    const { register, handleSubmit, control, watch, setValue, reset } = useForm();
    // Watch for delay value changes

    const [delayValue, setDelayValue] = useState<number>(OPTIONS_DELAY_ENUM.NO_DELAY);
    const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('20:00');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);


    // SPECIFIC_DELAY
    const [specificStartDate, setSpecificStartDate] = useState('');
    const [specificEndDate, setSpecificEndDate] = useState('');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>([]);

    const numRequest = prefillData.length;

    const onCheckData = async (event: any) => {
        setIsLoading(true);
        event.preventDefault();
        // This would be your API call to check the data
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, message: string, fields: any, prefillData: any, form: any }>('/api/form/get.prefill', {
                data_url: urlData,
                id: dataForm?.form?.id
            });

            setFields(res.data?.fields);
            setPrefillData(res.data?.prefillData);
            setPrefillForm(res.data?.form);
            setError('');
            setValue('delay', OPTIONS_DELAY_ENUM.NO_DELAY);
            setValue('scheduleEnabled', false);
            setValue('startTime', '08:00');
            setValue('endTime', '20:00');
            setValue('disabledDays', []);

            // Set form values for each question in the form data
            if (res.data?.form?.loaddata) {
                // Reset any previous form values first
                reset();
                // Set default values for each question based on the form data
                res.data.form.loaddata.forEach((item: any) => {
                    if (item.id && item.field) {
                        let foundField = res.data.fields.find((field: any) => Helper.purify(field.label) == Helper.purify(item.field));
                        if (foundField) {
                            setValue(`question_${item.id}`, foundField.id);
                        }

                    }
                });

            }

            Toast.success('Dữ liệu đã được tải thành công!');
        } catch (err) {
            setError("Lỗi khi kiểm tra dữ liệu, vui lòng kiểm tra lại quyền truy cập Google Sheet của bạn!");
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmitPrefill = async (data: any) => {
        // This would be your API call to run the prefill
        console.log("Running prefill with data:", data);

        if (chatErrors.some(error => error.type === 'error') && !isShowErrorMessage) {
            setIsShowErrorMessage(true);
            return;
        }

        setIsLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/create.prefill.run', {
                form_id: dataForm?.form?.id,
                ...data,
                delay_type: delayValue,
                num_request: numRequest,
                data_url: urlData,
                schedule_enabled: scheduleEnabled ? 1 : 0,
                start_time: startTime,
                end_time: endTime,
                disabled_days: disabledDays.join(','),
                specific_start_date: specificStartDate,
                specific_end_date: specificEndDate,
                specific_daily_schedules: specificDailySchedules.map(e => `${e.date}_${e.startTime}_${e.endTime}_${e.enabled}`).join(',')
            });

            if (response.data?.code == Code.SUCCESS) {
                Toast.success('Đã tạo yêu cầu điền form thành công!');
                router.push(`/`);


                const win = window as any;
                //@ts-ignore
                if (win.PulseSurvey.surveyIgnored?.(PULSES_TOKEN)) {
                    console.log('User has ignored the survey');
                } else if (win.PulseSurvey.surveyResponded?.(PULSES_TOKEN)) {
                    console.log('User has answered the survey');
                } else {
                    // You can call to show survey directly
                    win.PulseSurvey.showSurvey?.(PULSES_TOKEN);
                }

            } else {
                Toast.error(response.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
                console.error('Form submission failed');
            }

            console.log("res", response);
            setIsLoading(false);
        } catch (err) {
            Toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
            console.error('Form submission failed');
            setIsLoading(false);

        }

        setSubmitDisabled(false);
    };



    const toggleChat = (): void => {
        setChatOpen(!chatOpen);
    };

    const removeChatError = (errorId: string): void => {
        setChatErrors(chatErrors.filter(error => error.id !== errorId));
    };

    const addChatError = (chatErrors: ChatError[], message: string, errorId: string, type: 'error' | 'warning' | 'note'): void => {
        // Check if error already exists
        if (chatErrors.some(error => error.id === errorId)) return;
        chatErrors.push({ id: errorId, message, type });
    };


    const validateConfig = (chatErrors: ChatError[]): void => {


        if (!dataForm?.latest_form_questions) {
            return addChatError(chatErrors, `Hiện tại hệ thống không thể kiểm tra config, hãy nhớ bật quyền chia sẻ nhé cho bất kì ai có link nhé`, `00000`, "error");
        }

        const latest_form_questions = dataForm?.latest_form_questions || [];
        if (latest_form_questions.length !== dataForm?.form.loaddata?.length) {
            addChatError(chatErrors, `Có sự khác nhau giữa dữ liệu form hiện tại và dữ liệu form mới nhất. Hãy kiểm tra lại dữ liệu form mới nhất nhé!`, `00000`, "error");
        }

        let min_length = Math.min(latest_form_questions.length, dataForm?.form.loaddata?.length || 0);
        for (let i = 0; i < min_length; i++) {
            const latest_question = latest_form_questions[i];
            const question = dataForm?.form.loaddata[i];

            if (question?.type != latest_question?.type) {
                console.log(question, latest_question);
                addChatError(chatErrors, `Có sự khác nhau giữa câu hỏi ${question.question} - ${question.description} với config mới nhất, hãy kiểm tra lại dữ liệu form mới nhất nhé!`, `00000`, "error");
                continue;
            }

            if (Helper.isSelectType(question?.type)) {
                let latest_answers = latest_question.answer || [];
                let answers = question.answer || [];

                if (latest_answers.length !== answers.length) {
                    addChatError(chatErrors, `Có sự khác nhau về cấu hình câu trả lời trong câu hỏi <b>${question.question} - ${question.description || ''}</b> với config mới nhất của Google Form, hãy đồng bộ lại`, `00000`, "error");
                    continue;
                }

                for (let j = 0; j < latest_answers.length; j++) {
                    const latest_answer = latest_answers[j];
                    const answer = answers[j];

                    // if (latest_answer.data != answer.data) {
                    //     addChatError(chatErrors, `Có sự khác nhau về cấu hình câu trả lời <b>${latest_answer.data}</b> trong câu hỏi <b>${question.question} - ${question.description || ''}</b> với config mới nhất của Google Form, hãy đồng bộ lại`, `00000`, "error");
                    //     break;
                    // }

                    if (latest_answer.go_to_section != answer.go_to_section) {
                        addChatError(chatErrors, `Có sự khác nhau về hướng đi theo câu trả lời <b>${latest_answer.data}</b> trong câu hỏi <b>${question.question} - ${question.description || ''}</b> với config mới nhất của Google Form, hãy đồng bộ lại`, `00000`, "error");
                        break;
                    }
                }
            }
        }

        const latest_form_sections = dataForm?.latest_form_sections || [];
        if (latest_form_sections.length !== dataForm?.form.sections?.length) {
            addChatError(chatErrors, `Có sự khác nhau giữa dữ liệu section hiện tại và dữ liệu section mới nhất. Hãy kiểm tra lại dữ liệu section mới nhất nhé!`, `00000`, "error");
        }

        const min_sections_length = Math.min(latest_form_sections.length, dataForm?.form.sections?.length || 0);

        for (let i = 0; i < min_sections_length; i++) {
            const latest_section = latest_form_sections[i];
            const section = dataForm?.form.sections[i];
            if (latest_section.next_section != section.next_section) {
                addChatError(chatErrors, `Có sự khác nhau về điều hướng section với config mới nhất của Google Form, hãy đồng bộ lại`, `00000`, "error");
                break;
            }
        }


        // Config validation logic
        if (dataForm?.config?.lang === null) {
            addChatError(chatErrors, `Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt thu thập email và tắt giới hạn trả lời nhé`, `00000`, "warning");
        } else {
            if (dataForm?.config?.isValidPublished === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Form chưa Xuất bản/Publish. Nếu là Form cũ (trước 2025) có thể bỏ qua lỗi này.`, `00004`, "error");
            } else if (dataForm?.config?.isValidPublished === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ Xuất bản/Publish Form nhé!`, `00004`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Phải chọn "Không thu thập email/ Do not Collect" trong setting.`, `00001`, "error");
            } else if (dataForm?.config?.isValidCollectEmail === "null") {
                addChatError(chatErrors, `Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt thu thập email. Phải chọn "Không thu thập email/ Do not Collect" trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidEditAnswer === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Phải tắt cho phép chỉnh sửa câu trả lời trong setting.`, `00002`, "error");
            } else if (dataForm?.config?.isValidEditAnswer === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt "cho phép chỉnh sửa câu trả lời" trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidLimitRes === "false") {
                addChatError(chatErrors, `<b>Google Form!</b> Phải tắt mọi giới hạn trả lời trong setting.`, `00003`, "error");
            } else if (dataForm?.config?.isValidLimitRes === "null") {
                addChatError(chatErrors, `<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt mọi giới hạn trả lời trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "true" &&
                dataForm?.config?.isValidEditAnswer === "true" &&
                dataForm?.config?.isValidLimitRes === "true" &&
                dataForm?.config?.isValidPublished === "true") {
                addChatError(chatErrors, `Tuyệt! Google form này setting OK. Hãy chuẩn bị data và nhập link data để bắt đầu.`, `00005`, "note");
            }
        }
    };




    // Calculate total and delay message
    const isInsufficientFunds = () => {
        return numRequest * OPTIONS_DELAY[delayValue].price > (user?.credit || 0);
    };

    const syncFormHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await Fetch.postWithAccessToken('/api/form/sync.config', {
                id: dataForm?.form.id,
            });

            await mutateForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
    };


    const insufficientFunds = isInsufficientFunds();

    useEffect(() => {
        if (dataForm?.form && dataForm?.form.loaddata) {
            const validateAll = () => {
                let chatErrors: ChatError[] = [];
                validateConfig(chatErrors);
                chatErrors.sort((a, b) => {
                    if (a.type === "error" && b.type !== "error") {
                        return -1;
                    } else if (a.type !== "error" && b.type === "error") {
                        return 1;
                    }
                    return 0;
                });
                setChatErrors(chatErrors);
            }


            validateAll();

            // Cleanup event listeners
            return () => {
            };
        }
    }, [dataForm, reloadEvent]);


    if (isLoadingForm || !dataForm) {
        return (
            <LoadingAbsolute />
        );
    }

    return (
        <>
            {isLoading && <LoadingAbsolute />}
            <section className="bg-gradient-to-b from-primary-50 to-white">
                <div className="container mx-auto px-4 pt-8 pb-6" data-aos="fade-up">
                    <div className="container mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-gray-900">Điền theo data có trước</h1>

                        <FormTypeNavigation formId={dataForm?.form?.id} type={'prefill'} />

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="space-y-4 text-xs text-gray-700">
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Hãy nhập link Google Sheet bộ data có sẵn của bạn vào ô dưới đây</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p>Vui lòng xem kỹ hướng dẫn bên dưới trước khi thực hiện. Video hướng dẫn chi tiết: <a target="_blank" href="https://www.youtube.com/watch?v=5UM5Q2-jsBI" className="text-primary-600 font-medium hover:underline">Xem tại đây</a></p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p>
                                        Nếu bạn có thay đổi ở Google Form, hãy
                                        <button onClick={syncFormHandle} className="mx-1 px-3 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition inline-flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            đồng bộ lại cấu hình
                                        </button>
                                        để cập nhật lại nhé
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto mb-8">
                        <form onSubmit={(e) => onCheckData(e)} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Thông tin Form</h3>
                            <div className="space-y-4">
                                <div className="relative">
                                    <label htmlFor="urlMain" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                                        Link Form
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            id="urlMain"
                                            readOnly
                                            value={dataForm?.form?.urlMain}
                                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="formName" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                                        Tên Form
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            id="formName"
                                            readOnly
                                            value={dataForm?.form?.name}
                                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-gray-50 text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="dataUrl" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                                        Link Data của bạn
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </span>
                                        <input
                                            type="text"
                                            id="dataUrl"
                                            value={urlData}
                                            onChange={(e) => setUrlData(e.target.value)}
                                            className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                            placeholder="Nhập đường dẫn Google Sheet có đuôi /edit của bạn..."
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full mt-6 inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Kiểm tra dữ liệu
                            </button>
                        </form>
                    </div>

                    {error && (
                        <div className="container mx-auto mb-8">
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md shadow-sm" role="alert">
                                <div className="flex items-center">
                                    <svg className="h-6 w-6 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-red-700 font-medium">{error}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {fields ? (
                        <form onSubmit={handleSubmit(onSubmitPrefill)} className="container mx-auto">
                            <div className="space-y-6">
                                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Liên kết dữ liệu với câu hỏi</h3>
                                    <div className="space-y-4">
                                        {prefillForm?.loaddata && prefillForm?.loaddata?.map((data: any, index: any) => (
                                            <div key={index} className="p-2 bg-gray-50 rounded-lg border border-gray-100 hover:shadow-sm transition-shadow">
                                                <div className="md:flex md:items-start gap-8">
                                                    <div className="md:w-2/5 mb-3 md:mb-0 flex-shrink-0">
                                                        <div className="bg-white p-3 rounded-md shadow-sm">
                                                            {data.description ? (
                                                                <>
                                                                    <label className="block font-semibold text-xs mb-1 text-gray-900 truncate max-w-[90%]">{data.question}</label>
                                                                    <label className="block text-xs text-gray-500 truncate max-w-[90%]">{data.description}</label>
                                                                </>
                                                            ) : (
                                                                <label className="block font-semibold text-xs text-gray-900 truncate max-w-[90%]">{data.question}</label>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="md:w-3/5">
                                                        <div className="relative">
                                                            <label
                                                                htmlFor={`question_${data.id}`}
                                                                className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-600"
                                                            >
                                                                Chọn cột để liên kết dữ liệu
                                                            </label>
                                                            <select
                                                                id={`question_${data.id}`}
                                                                {...register('question_' + data.id, { value: data.field })}
                                                                className="block w-full rounded-md bg-white px-3 py-3 text-xs text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                                defaultValue={data.field}
                                                            >
                                                                {fields && fields.map((field: any) => (
                                                                    <option key={field.id} value={field.id}>
                                                                        {field.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <CreateOrderForm
                                    disabledDays={disabledDays}
                                    scheduleEnabled={scheduleEnabled}
                                    startTime={startTime}
                                    endTime={endTime}
                                    userCredit={user?.credit || 0}
                                    numRequest={numRequest}
                                    delayType={delayValue}
                                    numRequestReadOnly={true}
                                    formId={dataForm?.form?.id}
                                    formName={dataForm?.form?.name}
                                    bankInfo={bankInfo}
                                    showBackButton={false}
                                    specificStartDate={specificStartDate}
                                    specificEndDate={specificEndDate}
                                    specificDailySchedules={specificDailySchedules}
                                    onSpecificStartDateChange={(value) => setSpecificStartDate(value)}
                                    onSpecificEndDateChange={(value) => setSpecificEndDate(value)}
                                    onSpecificDailySchedulesChange={(value) => setSpecificDailySchedules(value)}
                                    onNumRequestChange={(value) => {
                                        // This is read-only in prefill mode, but we need to provide the handler
                                        // No action needed
                                    }}
                                    onDelayTypeChange={(value) => {
                                        setDelayValue(value);
                                    }}
                                    onScheduleEnabledChange={(value) => {
                                        setScheduleEnabled(value);
                                    }}
                                    onStartTimeChange={(value) => {
                                        setStartTime(value);
                                    }}
                                    onEndTimeChange={(value) => {
                                        setEndTime(value);
                                    }}
                                    onDisabledDaysChange={(value) => {
                                        setDisabledDays(value);
                                    }}
                                    className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 max-w-[600px] mx-auto"
                                />

                                <button
                                    type="submit"
                                    className={`w-full max-w-[600px] mx-auto mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                        ${insufficientFunds || submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={insufficientFunds || submitDisabled}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {isShowErrorMessage ? 'Vẫn tiếp tục điền form' : 'Bắt đầu điền form'}
                                </button>

                                <div className="w-full mt-4 flex items-center justify-center">
                                    {isShowErrorMessage && chatErrors.some(error => error.type === 'error') && (
                                        <div className="w-full max-w-md text-red-800 bg-red-50 px-5 py-4 rounded-lg border border-red-200 shadow flex flex-col items-center animate-shake text-center" role="alert">
                                            <div className="flex items-center mb-2">
                                                <svg className="h-5 w-5 mr-2 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                <span className="text-base font-medium">Vui lòng kiểm tra và sửa các lỗi sau:</span>
                                            </div>
                                            <ul className="list-disc list-inside text-sm text-left pl-5 mb-3">
                                                {chatErrors.filter(error => error.type === 'error').map((error, index) => (
                                                    <li key={index} dangerouslySetInnerHTML={{ __html: error.message }}></li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="container mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="border-b border-gray-200 pb-4 mb-6">
                                <div className="flex items-center text-amber-600 gap-2 mb-3">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="font-medium">Nếu bạn <strong>thao tác lần đầu</strong>, hãy tạo bản sao cho form của mình và thực hiện trên bản sao trước nhé!</p>
                                </div>
                                <h2 className="text-2xl font-bold mb-2 text-gray-900 flex items-center gap-2">
                                    <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                    Hướng Dẫn
                                </h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
                                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white font-bold text-xs">1</span>
                                        <h3 className="text-lg font-bold text-gray-900">Chuẩn hoá dữ liệu</h3>
                                    </div>
                                    <div className="space-y-2 ml-8">
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Dòng đầu tiên là label cột dữ liệu, các cột nên sắp xếp theo thứ tự câu hỏi trong Google Form</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span><strong>Trắc nhiệm (chọn 1 đáp án):</strong> Nhập <strong>số thứ tự</strong> của đáp án trong form, bắt đầu từ 1</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span><strong>Trắc nhiệm (chọn nhiều đáp án):</strong> Nhập số tự tự đáp án ngăn cách bằng //, ví dụ: 1//3//4</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span><strong>Tự luận:</strong> Nhập trực tiếp đáp án, cố hạn chế dấu , ; và xuống dòng</span>
                                        </p>

                                        <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100 text-blue-800">
                                            <p className="font-semibold mb-1">Data mẫu (thông tin cá nhân đều là thông tin ảo):</p>
                                            <a href="https://docs.google.com/spreadsheets/d/1dqZwuXIQJ1VnnRGsVU5eS40zN1wB2Q9U/edit"
                                                className="text-blue-600 hover:underline"
                                                target="_blank"
                                                rel="noopener noreferrer">
                                                https://docs.google.com/spreadsheets/d/1dqZwuXIQJ1VnnRGsVU5eS40zN1wB2Q9U/edit
                                            </a>
                                        </div>

                                        <div className="mt-3 p-3 bg-yellow-50 rounded-md border border-yellow-100 text-yellow-800">
                                            <p>Bạn có thể sử dụng tính năng <strong>mã hóa data</strong> để có data chuẩn hóa nhanh chóng (Hướng dẫn tại link video đầu trang).</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center">
                                    <div className="relative rounded-md overflow-hidden shadow-md border border-gray-200">
                                        <Image
                                            src="/static/img/prefill-s1.png"
                                            alt="Fillform Step 1"
                                            width={500}
                                            height={300}
                                            className="w-full object-contain"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-2 text-xs">
                                            Ví dụ về dữ liệu chuẩn hóa
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-start mb-10">
                                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white font-bold text-xs">2</span>
                                        <h3 className="text-lg font-bold text-gray-900">Căn sửa data</h3>
                                    </div>
                                    <div className="space-y-2 ml-8">
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Chọn toàn bộ <strong>phần data trong câu hỏi chọn nhiều đáp án</strong> và chuyển về định dạng kí tự <strong>"Plain Text"</strong></span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Chỉnh sửa, thêm xóa dữ liệu theo điều hướng session phù hợp (nếu có)</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center">
                                    <div className="relative rounded-md overflow-hidden shadow-md border border-gray-200">
                                        <Image
                                            src="/static/img/prefill-s3.png"
                                            alt="Fillform Step 2"
                                            width={500}
                                            height={300}
                                            className="w-full object-contain"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-2 text-xs">
                                            Định dạng "Plain Text" cho dữ liệu
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 items-start mb-6">
                                <div className="p-5 bg-gray-50 rounded-lg border border-gray-100">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary-600 text-white font-bold text-xs">3</span>
                                        <h3 className="text-lg font-bold text-gray-900">Copy đường dẫn edit của data sheet Google</h3>
                                    </div>
                                    <div className="space-y-2 ml-8">
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Tải bộ data excel của bạn lên <strong>google sheet</strong></span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Mở <strong>quyền truy cập edit</strong> cho file này</span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Copy đường dẫn edit của sheet vào ô phía trên, <strong>phải có đuôi /edit</strong></span>
                                        </p>
                                        <p className="flex items-start gap-2">
                                            <span className="text-primary-600 font-bold">•</span>
                                            <span>Ấn <strong>Kiểm tra dữ liệu</strong>, sau đó chỉnh sửa liên kết dữ liệu với câu hỏi</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-center items-center">
                                    <div className="relative rounded-md overflow-hidden shadow-md border border-gray-200">
                                        <Image
                                            src="/static/img/prefill-s2.png"
                                            alt="Fillform Step 3"
                                            width={500}
                                            height={300}
                                            className="w-full object-contain"
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-center py-2 text-xs">
                                            Đường dẫn Google Sheet có đuôi /edit
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>


            <WarningChatBox
                chatOpen={chatOpen}
                chatErrors={chatErrors}
                toggleChat={toggleChat}
                removeChatError={removeChatError}
            />
        </>
    );
}