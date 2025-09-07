'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code, ORDER_TYPE, AI_CASES, PULSES_TOKEN } from '@/core/Constants';
import CreateOrderForm from '@/components/form/CreateOrderForm';
import { Toast } from '@/services/Toast';
import { useMe, useMyBankInfo } from '@/hooks/user';
import { useFormById } from '@/hooks/form';
import LoadingAbsolute from '@/components/loading';
import { usePostHog } from 'posthog-js/react';
import { FormTypeNavigation } from '../../../_components/FormTypeNavigation';
import WarningChatBox from '../../../_components/WarningChatBox';
import { Helper } from '@/services/Helper';
import { FormInfoSection } from '../../../_components/FormInfoSection';

interface ApiResponse {
    code: number;
    data: {
        _id: string;
    };
    message?: string;
}

interface ChatError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'note';
}


const MAX_EXPECTED_OUTCOME_LENGTH = 10000000;
const AI_PREMIUM = 100;

export default function FormAIOrder() {
    const params = useParams();
    const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(params.id as string);
    const [isLoading, setIsLoading] = useState(false);
    const me = useMe();
    const bankInfo = useMyBankInfo();
    const posthog = usePostHog();
    const router = useRouter();

    // CreateOrderForm state variables
    const [numRequest, setNumRequest] = useState('');
    const [delayType, setDelayType] = useState('0');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [scheduleEnabled, setScheduleEnabled] = useState(false);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('20:00');
    const [specificStartDate, setSpecificStartDate] = useState('');
    const [specificEndDate, setSpecificEndDate] = useState('');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>([]);

    // AI-specific state variables
    const [demographicGoal, setDemographicGoal] = useState('');
    const [spssGoal, setSpssGoal] = useState('');
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [chatOpen, setChatOpen] = useState<boolean>(true);
    const [chatErrors, setChatErrors] = useState<ChatError[]>([]);
    const [reloadEvent, setReloadEvent] = useState(false);
    const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

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
                addChatError(chatErrors, `Tuyệt! Google form này setting OK. Hãy điền prompt để điền form nhé.`, `00005`, "note");
            }
        }
    };

    useEffect(() => {
        if (dataForm) {
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
            return () => { };
        }
    }, [dataForm, reloadEvent]);

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!dataForm || !numRequest || parseInt(numRequest) <= 0) {
            Toast.error('Vui lòng nhập số lượng khảo sát');
            return;
        }
        if (!demographicGoal) {
            Toast.error('Vui lòng nhập kết quả nhân khẩu học mong muốn');
            return;
        }
        if (demographicGoal.length > MAX_EXPECTED_OUTCOME_LENGTH) {
            Toast.error(`Kết quả nhân khẩu học không được vượt quá ${MAX_EXPECTED_OUTCOME_LENGTH} từ`);
            return;
        }
        if (!spssGoal) {
            Toast.error('Vui lòng nhập kết quả dữ liệu mong muốn');
            return;
        }
        if (spssGoal.length > MAX_EXPECTED_OUTCOME_LENGTH) {
            Toast.error(`Kết quả dữ liệu không được vượt quá ${MAX_EXPECTED_OUTCOME_LENGTH} từ`);
            return;
        }

        setIsLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<ApiResponse>('/api/order/create.agent.run', {
                form_id: dataForm.form.id,
                num_request: parseInt(numRequest),
                demographic_goal: demographicGoal,
                spss_goal: spssGoal,
                delay_type: parseInt(delayType),
                // Add scheduling parameters
                disabled_days: disabledDays.join(','),
                schedule_enabled: scheduleEnabled ? 1 : 0,
                start_time: startTime,
                end_time: endTime,
                specific_start_date: specificStartDate,
                specific_end_date: specificEndDate,
                specific_daily_schedules: specificDailySchedules.map((schedule) =>
                    `${schedule.date}_${schedule.startTime}_${schedule.endTime}_${schedule.enabled}`).join(',')
            });

            if (response.data.code === Code.SUCCESS) {
                posthog?.capture('create_ai_order', {
                    formId: dataForm.form.id,
                    numRequest: parseInt(numRequest),
                    demographicGoal,
                    spssGoal,
                    delayType: parseInt(delayType),
                });

                Toast.success('Đặt đơn thành công');
                router.push(`/`);

                // Survey prompt (similar to FormRateOrder)
                const win = window as any;
                if (win.PulseSurvey?.surveyIgnored?.(PULSES_TOKEN)) {
                    console.log('User has ignored the survey');
                } else if (win.PulseSurvey?.surveyResponded?.(PULSES_TOKEN)) {
                    console.log('User has answered the survey');
                } else if (win.PulseSurvey?.showSurvey) {
                    // Show survey directly
                    win.PulseSurvey.showSurvey(PULSES_TOKEN);
                }
            } else {
                Toast.error(response.data.message || 'Có lỗi xảy ra');
            }
        } catch (error) {
            console.error('Error creating order:', error);
            Toast.error('Có lỗi xảy ra');
        } finally {
            setIsLoading(false);
            setSubmitDisabled(false);
        }
    };

    if (isLoadingForm || !dataForm) return <LoadingAbsolute />;

    return (
        <>
            {isLoading && <LoadingAbsolute />}
            <WarningChatBox
                chatOpen={chatOpen}
                chatErrors={chatErrors}
                toggleChat={toggleChat}
                removeChatError={removeChatError}
            />
            <section className="bg-gradient-to-b from-primary-50 to-white">
                <div className="container mx-auto px-4 pt-8 pb-6" data-aos="fade-up">
                    <div className="container mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-gray-900">Điền form bằng AI Agent</h1>

                        <FormTypeNavigation formId={dataForm.form.id} type={'ai'} />

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="md:grid md:grid-cols-2 md:gap-8">
                                <div className="space-y-4 text-xs text-gray-700">
                                    <div className="flex items-start gap-2">
                                        <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        <p>Điền form tự động bằng AI Agent thông minh, tạo ra dữ liệu đa dạng và chân thực.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="flex-shrink-0 h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p>Bạn có thể điều chỉnh kết quả mong muốn và tốc độ điền form theo nhu cầu.</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="flex-shrink-0 h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                        <p>Nếu mô hình của bạn chứa biến điều tiết AI sẽ chưa xử lý được, hãy liên hệ với chúng tôi để được hỗ trợ</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                                        <p>Nếu bạn có thay đổi ở Google Form, hãy <button onClick={syncFormHandle} className="mx-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-md font-semibold hover:bg-primary-200 transition-all duration-200 inline-flex items-center text-sm">đồng bộ lại cấu hình</button> để cập nhật.</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <p>Video hướng dẫn chi tiết: <a target="_blank" href="https://www.youtube.com/watch?v=1tllw_ZCHls" className="text-primary-600 font-medium hover:underline">Xem tại đây</a></p>
                                    </div>
                                </div>
                                <div className="border-t md:border-t-0 md:border-l border-gray-200 mt-6 md:mt-0 pt-6 md:pt-0 md:pl-8">
                                    <ul className="space-y-3 text-xs text-gray-700">
                                        <li className="flex items-start gap-2 transition-all duration-200 hover:text-primary-600">
                                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <p>Tạo ra dữ liệu chân thực và có ý nghĩa học thuật.</p>
                                        </li>
                                        <li className="flex items-start gap-2 transition-all duration-200 hover:text-primary-600">
                                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <p>Tự động điền form liên kết chuẩn dữ liệu nhân khẩu học theo yêu cầu.</p>
                                        </li>
                                        <li className="flex items-start gap-2 transition-all duration-200 hover:text-primary-600">
                                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <p>Tự động điền form để dữ liệu nghiên cứu có ý nghĩa.</p>
                                        </li>
                                        <li className="flex items-start gap-2 transition-all duration-200 hover:text-primary-600">
                                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <p>Xuất báo cáo học thuật, đọc dữ liệu miễn phí.</p>
                                        </li>
                                        <li className="flex items-start gap-2 transition-all duration-200 hover:text-primary-600">
                                            <svg className="flex-shrink-0 h-5 w-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                                            <p>Phù hợp cho các nghiên cứu về các mô hình hồi quy, mô hình SEM trong phần mềm SPSS.</p>
                                        </li>

                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto mb-2">
                        <FormInfoSection dataForm={dataForm} />
                    </div>

                    <div className="container mx-auto">
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    <h3 className="text-xl font-bold text-gray-900">CẤU HÌNH AI AGENT</h3>
                                </div>


                                <form className='space-y-6' onSubmit={handleSubmit}>
                                    <div className="flex flex-col lg:flex-row gap-8 mb-6">
                                        {/* Left Column - Prompt Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">

                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                                <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                Prompt
                                            </h3>

                                            <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm pl-2 mb-8">
                                                <li>Loại bỏ điều hướng session, chỉ nên dùng 1 luồng khảo sát cho 1 đối tượng</li>
                                                <li>Viết prompt để Pass qua hết gạn lọc, mặc định chúng đều hợp lệ</li>
                                                <li>Không nên trộn lẫn kết quả với các nguồn khảo sát khác</li>
                                                <li>Mô tả càng chi tiết, AI càng hiểu rõ mong muốn của bạn</li>
                                            </ul>
                                        </div>

                                        {/* Right Column - Results Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">

                                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                                                <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Kết quả mẫu
                                            </h3>

                                            <div className="flex-1">
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {AI_CASES.map((aiCase, index) => (
                                                        <button
                                                            key={aiCase.id}
                                                            type="button"
                                                            onClick={() => setSelectedCaseIndex(index)}
                                                            className={`text-xs px-3 py-1.5 rounded-full ${selectedCaseIndex === index ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                                        >
                                                            Use Case {index + 1}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex flex-row justify-between gap-4 mb-2">
                                                    {AI_CASES[selectedCaseIndex]?.image && (
                                                        <div className="text-center bg-gray-50 p-3 rounded-md border border-gray-200 flex-1 flex items-center justify-center">
                                                            <img
                                                                src={`/static/usecase/${AI_CASES[selectedCaseIndex].image}`}
                                                                alt="Sample result visualization"
                                                                className="max-h-[100px] mx-auto rounded-md object-contain"
                                                            />
                                                        </div>
                                                    )}

                                                    <div className="flex flex-col gap-3 mb-0 mt-auto">
                                                        {AI_CASES[selectedCaseIndex]?.result_data_url && (
                                                            <a
                                                                href={`/static/usecase/${AI_CASES[selectedCaseIndex].result_data_url}`}
                                                                download
                                                                className="text-sm px-3 py-2 flex items-center gap-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                            >
                                                                <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                </svg>
                                                                Bảng dữ liệu
                                                                <svg className="h-4 w-4 text-primary-600 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                        {AI_CASES[selectedCaseIndex]?.result_report_url && (
                                                            <a
                                                                href={`/static/usecase/${AI_CASES[selectedCaseIndex].result_report_url}`}
                                                                download
                                                                className="text-sm px-3 py-2 flex items-center gap-1.5 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                                            >
                                                                <svg className="h-4 w-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                                </svg>
                                                                Báo cáo kết quả
                                                                <svg className="h-4 w-4 text-primary-600 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-8 mb-6">
                                        {/* Left Column - Prompt Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">
                                            <div className="relative flex-1">
                                                <label htmlFor="demographicGoal" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                                                    Yêu cầu nhân khẩu học mong muốn
                                                </label>
                                                <textarea
                                                    id="demographicGoal"
                                                    value={demographicGoal}
                                                    onChange={(e) => setDemographicGoal(e.target.value)}
                                                    className="w-full p-3 border text-xs rounded-md border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent h-[240px]"
                                                    placeholder={`Giới tính của Anh/Chị/Bạn? gần 60% nữ
- Độ tuổi của Anh/Chị/Bạn?"
18-22 tuổi: 55.6%
23-25 tuổi: 35,7%
26-28 tuổi: 8,7%`}
                                                    maxLength={MAX_EXPECTED_OUTCOME_LENGTH}
                                                />
                                            </div>

                                        </div>

                                        {/* Right Column - Results Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">
                                            <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                                                <div className="flex items-center mb-4">
                                                    <span className="font-medium text-xs">Yêu cầu nhân khẩu học mong muốn</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-gray-200 overflow-y-auto max-h-[200px] text-xs">
                                                    <div className="text-gray-700">

                                                        <div className="text-xs text-gray-600 whitespace-pre-line">
                                                            {AI_CASES[selectedCaseIndex]?.demographicGoal?.trim() || 'Chưa có yêu cầu nhân khẩu học.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-8 mb-6">
                                        {/* Left Column - Prompt Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">

                                            <div className="space-y-5 flex flex-col">
                                                <div className="relative flex-1">
                                                    <label htmlFor="spssGoal" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                                                        Yêu cầu về mô hình SPSS
                                                    </label>
                                                    <textarea
                                                        id="spssGoal"
                                                        value={spssGoal}
                                                        onChange={(e) => setSpssGoal(e.target.value)}
                                                        className="w-full p-3 border text-xs rounded-md border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent h-[350px]"
                                                        placeholder={`Mô hình hồi quy 5 biến độc lập TC,NC,AT,CX,TN tác động 1 biến phụ thuộc "sự hài lòng". Sử dụng thang đo linkert 5
Nghiên cứu các giả thuyết các yếu tố ảnh hưởng tích cực đến sự hài lòng. Yêu cầu chấp nhận tất cả các giả thuyết.
Chú thích các yếu tố tương ứng với các câu hỏi trong form như sau
TC:Khả năng tiếp cận
NC: Tính nhanh chóng
AT: An toàn , An ninh
CX:Tính chính xác
TN: Tiện nghi, thoải mái
Xác định và đo lường mức độ ảnh hưởng của các yếu tố trên đến sự hài lòng chất lượng dịch vụ
Xác định các yếu tố này tác động trực tiếp hay gián tiếp đến sự hài lòng chất lượng dịch vụ`}
                                                        maxLength={MAX_EXPECTED_OUTCOME_LENGTH}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Column - Results Section */}
                                        <div className="w-full lg:w-1/2 flex flex-col">
                                            <div className="bg-gray-50 p-3 flex-grow flex-1 rounded-md border border-gray-200">
                                                <div className="flex items-center mb-4">
                                                    <span className="font-medium text-xs">Yêu cầu về mô hình SPSS</span>
                                                </div>
                                                <div className="bg-white p-3 rounded border border-gray-200 overflow-y-auto text-xs">
                                                    <div className="text-gray-700">

                                                        <div className="text-xs text-gray-600 whitespace-pre-line flex-1 flex">
                                                            {AI_CASES[selectedCaseIndex]?.spssGoal?.trim() || 'Chưa có yêu cầu về dữ liệu và đánh giá.'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className='space-y-6'>

                                    </div>
                                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 mb-4 mt-2">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                                    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <p className="text-sm text-yellow-700">
                                                Các số liệu về tỉ lệ sẽ chỉ là tương đối không thể chính xác 100%, AI agent sẽ điều chỉnh cho sát với thực tế nhất
                                            </p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <h3 className="text-xl font-bold text-gray-900">TẠO YÊU CẦU ĐIỀN FORM</h3>
                                        </div>

                                        <CreateOrderForm
                                            orderType={ORDER_TYPE.AGENT}
                                            userCredit={me.data?.credit || 0}
                                            numRequest={parseInt(numRequest) || 0}
                                            delayType={parseInt(delayType) || 0}
                                            formId={dataForm?.form?.id}
                                            formName={dataForm?.form?.name}
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
                                            specificStartDate={specificStartDate}
                                            specificEndDate={specificEndDate}
                                            specificDailySchedules={specificDailySchedules}
                                            onSpecificStartDateChange={(value) => setSpecificStartDate(value)}
                                            onSpecificEndDateChange={(value) => setSpecificEndDate(value)}
                                            onSpecificDailySchedulesChange={(value) => setSpecificDailySchedules(value)}
                                            className="max-w-full"
                                            showTitle={false}
                                            showBackButton={false}
                                        />

                                        <button
                                            disabled={submitDisabled || isLoading}
                                            className={`w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                    ${submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {isLoading ? 'Đang xử lý...' : 'Đặt đơn ngay'}
                                        </button>
                                    </div>
                                </form>


                            </div>


                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
