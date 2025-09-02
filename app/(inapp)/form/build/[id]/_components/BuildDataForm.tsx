'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FormTypeNavigation } from "../../../_components/FormTypeNavigation"
import WarningChatBox from "../../../_components/WarningChatBox";
import { useFormById } from '@/hooks/form';
import { useParams } from 'next/navigation';
import Fetch from '@/lib/core/fetch/Fetch';
import LoadingAbsolute from '@/components/loading';
import { DataModel, RawDataModel, RawForm } from '@/store/types';
import { Helper } from '@/services/Helper';
import { useRouter } from 'next/navigation';
import { QUESTION_TYPE, Code, OPTIONS_DELAY_ENUM, ORDER_TYPE, PULSES_TOKEN } from '@/core/Constants';
import { FormInfoSection } from '../../../_components/FormInfoSection';
import { BasicModelBuilder } from './BasicModelBuilder'
import { Toast } from '@/services/Toast';
import { CreateOrderForm } from "@/components/form";
import { useMe, useMyBankInfo } from '@/hooks/user';
import { useMyDataModels, useUserDataModels } from '@/hooks/data.model';
import { ModelAdvanceBuilder } from '@/app/(inapp)/data/builder/_components/ModelAdvanceBuilder';

interface ChatError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'note';
}


export default function BuildDataForm() {

    const params = useParams();
    const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(params.id as string);
    const { register, handleSubmit, watch, setValue } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [reloadEvent, setReloadEvent] = useState(false);
    const router = useRouter();

    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(true);
    const [chatErrors, setChatErrors] = useState<ChatError[]>([]);

    const availableQuestions = dataForm?.form.loaddata || [];

    const [model, setModel] = useState<DataModel | null>(null);

    // CreateOrderForm state variables
    const { data: user } = useMe();
    const bankInfo = useMyBankInfo();
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const [isShowErrorMessage, setIsShowErrorMessage] = useState<boolean>(false);
    const [delayValue, setDelayValue] = useState<number>(OPTIONS_DELAY_ENUM.NO_DELAY);
    const [scheduleEnabled, setScheduleEnabled] = useState<boolean>(false);
    const [startTime, setStartTime] = useState<string>('08:00');
    const [endTime, setEndTime] = useState<string>('20:00');
    const [disabledDays, setDisabledDays] = useState<number[]>([]);
    const [specificStartDate, setSpecificStartDate] = useState('');
    const [specificEndDate, setSpecificEndDate] = useState('');
    const [specificDailySchedules, setSpecificDailySchedules] = useState<any[]>([]);



    const modelsData = useMyDataModels(1, 200, {});
    const [modelMode, setModelMode] = useState<'basic' | 'advance'>('basic');


    const [selectedAdvanceModel, setSelectedAdvanceModel] = useState<RawDataModel | null>(null);
    const [advanceModelData, setAdvanceModelData] = useState<any>(null);

    const [numRequest, setNumRequest] = useState<number>(1);

    const modelQuestions = useMemo(() => {
        let res: any[] = model?.model?.questions || [];

        function getQuestions(observedItems: any[]) {
            for (let i = 0; i < (observedItems?.length || 0); i++) {
                res = [...res, ...(observedItems[i].questions || [])];
                if (observedItems[i].observedItems) {
                    getQuestions(observedItems[i].observedItems);
                }
            }
        }

        getQuestions(model?.observedItems || []);
        return res;
    }, [model]);


    const [mappingQuestionToVariable, setMappingQuestionToVariable] = useState<{ [key: string]: string }>({});

    const onSubmit = async (data: any) => {
        // Handle form submission
        setIsSaved(true);
        try {
            await Fetch.postWithAccessToken('/api/form/save.model', {
                id: dataForm?.form.id,
                ...data,
                advance_model: JSON.stringify(advanceModelData),
                model: JSON.stringify(model),

                data_model_id: selectedAdvanceModel?.id,
                mapping_question_to_variable: JSON.stringify(mappingQuestionToVariable),
                model_mode: modelMode,
            });

            Toast.success('Lưu model thành công');
        } catch (error) {
            console.error(error);

            // @ts-ignore
            Toast.error(error.message || 'Lỗi khi lưu model');
        }

        setIsLoading(false);
        setIsSaved(true);
    };

    // Form submission handler for CreateOrderForm
    const onSubmitOrder = async () => {
        if (chatErrors.some(error => error.type === 'error') && !isShowErrorMessage) {
            setIsShowErrorMessage(true);
            return;
        }

        setIsLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/create.model.run', {
                form_id: dataForm?.form?.id,
                model: JSON.stringify(model),
                delay_type: delayValue,
                num_request: numRequest,
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
                if (win.PulseSurvey?.surveyIgnored?.(PULSES_TOKEN)) {
                    console.log('User has ignored the survey');
                } else if (win.PulseSurvey?.surveyResponded?.(PULSES_TOKEN)) {
                    console.log('User has answered the survey');
                } else {
                    // You can call to show survey directly
                    win.PulseSurvey?.showSurvey?.(PULSES_TOKEN);
                }
            } else {
                Toast.error(response.data?.message || 'Đã xảy ra lỗi, vui lòng thử lại!');
                console.error('Form submission failed', response);
            }

            console.log("res", response);
            setIsLoading(false);
        } catch (err) {
            Toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
            console.error('Form submission failed', err);
            setIsLoading(false);
        }

        setSubmitDisabled(false);
    };


    const autoFillHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, message: string, form: RawForm }>('/api/form/rate.autofill', {
                id: dataForm?.form.id,
            });

            await mutateForm();

            // After mutating, update all form values
            if (res.data.form.loaddata) {
                res.data.form.loaddata.forEach((question) => {
                    if (question.type) {
                        setValue(`isMulti-${question.id}`, question.isMulti);
                        setValue(`totalans-${question.id}`, question.totalAnswer);
                        setValue(`type-${question.id}`, question.type);

                        question.answer?.forEach((answer: any) => {
                            if (answer.data) {
                                setValue(`answer_${answer.id}`, answer.count);
                            }
                        });
                    } else {
                        question.answer?.forEach((answer: any) => {
                            setValue(answer.id, answer.count);
                            if (answer.data) {
                                setValue(`custom-${answer.id}`, answer.data);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
    };

    const syncFormHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            await Fetch.postWithAccessToken('/api/form/sync.config', {
                id: dataForm?.form.id,
                model: JSON.stringify(model),
            });

            await mutateForm();
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
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


    const validateInputs = (chatErrors: ChatError[]): void => {
        // Validation logic here
        // Similar to the original but using React state

        // Example validation:
        document.querySelectorAll("input[type='number']").forEach((input: Element) => {
            if (input instanceof HTMLInputElement) {
                const value = parseInt(input.value, 10);
                const errorId = `error-${input.id}`;

                if (value < 0 || value > 100) {
                    addChatError(chatErrors, `Giá trị không hợp lệ (${value}). Hãy điền tỉ lệ (%) là số tự nhiên từ 0-100`, errorId, "error");
                }
            }
        });

        // Add other validations as needed
        // Multi-choice validation
        document.querySelectorAll("[id^='isMulti-']").forEach((multiInput: Element) => {
            if (multiInput instanceof HTMLInputElement) {
                const questionId = multiInput.id.split('-')[1];
                const totalInput = document.getElementById(`totalans-${questionId}`);
                let sum = 0;

                if (multiInput.value === "1") { // Multi-choice question
                    document.querySelectorAll(`input[id^='answer_${questionId}']`).forEach((input: Element) => {
                        if (input instanceof HTMLInputElement) {
                            sum += parseInt(input.value, 10) || 0;
                        }
                    });

                    if (sum < 120) {
                        addChatError(chatErrors, `Câu chọn nhiều đáp án. Cần điền tỉ lệ (%) là số tự nhiên từ 0-100. Và tổng tỉ lệ nên lớn hơn 120, để trộn tốt nhất (hiện tại: ${sum})`, `multi-error-${questionId}`, "error");
                    }
                }
            }
        });

        // "Other" option validation
        document.querySelectorAll(".js-answer-select").forEach((select: Element) => {
            if (select instanceof HTMLSelectElement) {
                const questionDom = select.closest(".js-question");
                const questionId = questionDom?.id?.replace("question-", "");

                let question = dataForm?.latest_form_questions?.find(q => q.id == questionId);
                if (select.value.toLowerCase().includes("other")) {
                    addChatError(chatErrors, `Bạn chọn "other - bỏ qua không điền". Hãy kiểm tra lại đã tắt bắt buộc điền câu hỏi <b>${question?.question} - ${question?.description || ''}</b> trên Google Form chưa?`, `select-error-${select.id}`, question?.required ? "error" : "warning");
                }
            }
        });
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
                addChatError(chatErrors, `Có sự khác nhau giữa câu hỏi ${question.question} - ${question.description || ''} với config mới nhất, hãy kiểm tra lại dữ liệu form mới nhất nhé!`, `00000`, "error");
                continue;
            }

            if (question.type == QUESTION_TYPE.FILE) {
                addChatError(chatErrors, `Chưa hỗ trợ câu hỏi loại file ${question.question} - ${question.description || ''}`, `00000`, "error");
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

                    if (latest_answer.data != answer.data) {
                        addChatError(chatErrors, `Có sự khác nhau về cấu hình câu trả lời <b>${latest_answer.data}</b> trong câu hỏi <b>${question.question} - ${question.description || ''}</b> với config mới nhất của Google Form, hãy đồng bộ lại`, `00000`, "error");
                        break;
                    }

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
                addChatError(chatErrors, `Tuyệt! Google form này setting OK. Hãy config tỉ lệ nhé.`, `00005`, "note");
            }
        }
    };

    // Function to handle select change
    const handleSelectChange = (selectId: string) => {
        const select = document.getElementById(selectId) as HTMLSelectElement;
        if (select) {
            const inputId = selectId.replace("select-", "custom-");
            const textarea = document.getElementById(inputId) as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.display = select.value === "custom (nội dung tùy chỉnh)" ? "block" : "none";
            }
        }
    };

    useEffect(() => {
        // Generate a unique ID for variables
        const generateId = () => {
            return `id_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        };
        if (dataForm?.form && dataForm?.form.data_model) {
            setModel(dataForm?.form.data_model);

        } else if (dataForm?.form && !dataForm?.form.data_model) {
            const initialModel: DataModel = {
                model: {
                    code: generateId().substring(0, 8),
                    name: `Biến phụ thuộc`,
                    model: 'linear_regression',
                    questions: []
                },
                observedItems: []
            };
            setModel(initialModel);
        }

        if (dataForm?.form && dataForm?.form.model_mode) {
            if (dataForm?.form.model_mode === 'advance') {
                setModelMode('advance');
            } else {
                setModelMode('basic');
            }
        }

        if (dataForm?.form && dataForm?.form.advance_model_config?.data_model_id && modelsData?.data?.data_models) {
            const model = modelsData?.data?.data_models?.find((model) => model.id === dataForm?.form.advance_model_config?.data_model_id);
            if (model) {
                setSelectedAdvanceModel(model);
                setAdvanceModelData(model.data_model);
            }
        }


        if (dataForm?.form && dataForm?.form.advance_model_config?.mapping_question_to_variable) {
            setMappingQuestionToVariable(dataForm?.form.advance_model_config?.mapping_question_to_variable)
        }

        if (dataForm?.form && dataForm?.form.loaddata) {
            const validateAll = () => {
                let chatErrors: ChatError[] = [];
                validateInputs(chatErrors);
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

            // Add event listeners for form validation
            const numberInputs = document.querySelectorAll("input[type='number']");
            const selects = document.querySelectorAll(".js-answer-select");

            const handleInputChange = () => {
                validateAll();
                setIsSaved(false);
            }

            numberInputs.forEach(input => {
                input.addEventListener('input', handleInputChange);
            });

            // Initialize textarea visibility
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                handleSelectChange(selectElement.id);
            });

            // Add event listeners for select changes
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                selectElement.addEventListener('change', () => {
                    handleSelectChange(selectElement.id);
                    validateAll();
                    setIsSaved(false);
                });
            });

            validateAll();

            // Cleanup event listeners
            return () => {
                numberInputs.forEach(input => {
                    input.removeEventListener('input', handleInputChange);
                });

                selects.forEach((select: Element) => {
                    const selectElement = select as HTMLSelectElement;
                    selectElement.removeEventListener('change', () => handleSelectChange(selectElement.id));
                });
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
            <section className="bg-gradient-to-b from-primary-50 to-white">
                <div className="container mx-auto px-4 pt-8 pb-6" data-aos="fade-up">

                    {(isLoading) && <LoadingAbsolute />}
                    <div className="container mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-gray-900">Điền theo mô hình NCKH</h1>

                        <FormTypeNavigation formId={dataForm?.form?.id} type={'build'} />

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="space-y-4 text-xs text-gray-700">
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Bạn có thể <b>tự xây dụng mô hình hồi quy tuyến tính</b>, sau đó với mỗi biến, bạn có thể chọn danh sách các câu hỏi thuộc biến trong mô hình</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Bạn điền <b>tỉ lệ mong muốn (đơn vị %) là số tự nhiên</b>, tương ứng với mỗi đáp án của câu hỏi với những câu hỏi còn lại không thuộc mô hình</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Hãy loại bỏ điều hướng session hoặc điền tỉ lệ để đạt hết gạn lọc nhé.</p>
                                </div>
                                <div className="flex items-start gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                    <p>
                                        Nếu bạn chưa biết điền, hãy thử
                                        <button onClick={autoFillHandle} className="mx-1 px-3 py-0.5 bg-primary-100 text-primary-700 rounded-full font-medium hover:bg-primary-200 transition inline-flex items-center">
                                            <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                            tự động đề xuất tỉ lệ
                                        </button>
                                        để tham khảo, chỉ mang tính chất tham khảo.
                                    </p>
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
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p>FillForm sẽ cam kết điền form đúng theo tỉ lệ và tất cả giả thuyết trong mô hình</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p>Video hướng dẫn chi tiết: <a href="https://www.youtube.com/watch?v=OAqOKzjy84A" className="text-primary-600 font-medium hover:underline">Xem tại đây</a></p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="container mx-auto mb-2">
                        <FormInfoSection dataForm={dataForm} />
                    </div>

                    <div className="container mx-auto mb-2">
                        {/* Model Mode Selector */}
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-4">
                            <h3 className="text-lg font-semibold mb-4 text-gray-900">Chọn phương thức tạo Model</h3>
                            <div className="flex space-x-4 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setModelMode('basic')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${modelMode === 'basic'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    🔧 Basic - Xây dựng Model cơ bản
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setModelMode('advance')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${modelMode === 'advance'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    📋 Advance - Sử dụng Model có sẵn
                                </button>
                            </div>
                        </div>

                        {/* Conditional Rendering Based on Mode */}
                        {modelMode === 'basic' ? (
                            <BasicModelBuilder dataForm={dataForm} model={model} setModel={setModel} />
                        ) : (
                            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold mb-4 text-gray-900">Chọn Model từ danh sách có sẵn</h3>
                                {modelsData.isLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                        <span className="ml-2 text-gray-600">Đang tải danh sách model...</span>
                                    </div>
                                ) : modelsData.error ? (
                                    <div className="text-red-600 p-4 bg-red-50 rounded-lg">
                                        <p>Lỗi khi tải danh sách model: {modelsData.error?.message || 'Có lỗi xảy ra'}</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {/* Model Selection Dropdown */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Chọn Model có sẵn
                                            </label>
                                            <select
                                                value={selectedAdvanceModel?.id || ''}
                                                onChange={(e) => {
                                                    const modelId = e.target.value;
                                                    if (modelId) {
                                                        const model = modelsData.data?.data_models.find(m => m.id === modelId);
                                                        if (model) {
                                                            setSelectedAdvanceModel(model);
                                                            setAdvanceModelData(model.data_model);
                                                        }
                                                    } else {
                                                        setSelectedAdvanceModel(null);
                                                        setAdvanceModelData(null);
                                                    }
                                                }}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                                            >
                                                <option value="">-- Chọn một model --</option>
                                                {modelsData.data?.data_models?.map((dataModel: RawDataModel) => (
                                                    <option key={dataModel.id} value={dataModel.id}>
                                                        {dataModel.name} - {(dataModel.data_model?.nodes || []).length} biến - {new Date(dataModel.createdAt).toLocaleDateString('vi-VN')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Model Editor */}
                                        {selectedAdvanceModel && advanceModelData && (
                                            <div className="mt-6">
                                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <div className="flex items-center gap-2">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <p className="text-blue-800 text-sm font-medium">
                                                            Đang chỉnh sửa model: <strong>{selectedAdvanceModel.name}</strong>
                                                        </p>
                                                    </div>
                                                </div>
                                                <ModelAdvanceBuilder
                                                    mappingQuestionToVariable={mappingQuestionToVariable}
                                                    setMappingQuestionToVariable={setMappingQuestionToVariable}
                                                    questions={availableQuestions}
                                                    model={advanceModelData}
                                                    setModel={setAdvanceModelData}
                                                    useLocalStorage={false}
                                                />
                                            </div>
                                        )}

                                        {!modelsData.data?.data_models?.length && (
                                            <div className="text-center py-8 text-gray-500">
                                                <p>Không có model nào được tìm thấy.</p>
                                                <p className="text-sm mt-2">Hãy tạo model mới bằng cách chọn "Basic - Tự xây dựng Model".</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="text-left bg-gray-50 p-1 rounded-lg container mx-auto">
                        <div className="space-y-2">
                            {dataForm?.form.loaddata && dataForm?.form.loaddata.filter(e => {
                                if (modelMode == 'advance') {
                                    return !mappingQuestionToVariable[e.id]
                                } else {
                                    return !modelQuestions.find(modelQuestion => modelQuestion.id == e.id)
                                }

                            }).map((question, questionIndex) => (
                                <div key={questionIndex} id={`question-${question.id}`} className="js-question p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="md:flex md:items-start gap-8">
                                        <div className="md:w-1/4 md:max-w-1/4 md:min-w-1/4 mb-1 md:mb-0 flex-shrink-0">
                                            <div className="w-full">
                                                {question.description ? (
                                                    <>
                                                        <label className="block font-semibold text-xs mb-1 text-gray-900 truncate">{question.question}</label>
                                                        <label className="block text-xs text-gray-500 truncate">{question.description}</label>
                                                    </>
                                                ) : (
                                                    <label className="block font-semibold text-xs text-gray-900">{question.question}</label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="md:w-3/4 md:max-w-3/4 md:min-w-3/4 flex-grow">
                                            {question.type ? (
                                                <>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                                                        <input type="hidden" {...register(`isMulti-${question.id}`)} defaultValue={question.isMulti} />
                                                        <input type="hidden" {...register(`totalans-${question.id}`)} defaultValue={question.totalAnswer} />
                                                        <input type="hidden" {...register(`type-${question.id}`)} defaultValue={question.type} />

                                                        {question.answer && question.answer.map((answer: any, answerId: any) => (
                                                            answer.data && (
                                                                <div key={answerId} className="relative">
                                                                    <label
                                                                        htmlFor={`answer_${answer.id}`}
                                                                        className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                                    >
                                                                        {answer.data}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="any"
                                                                        id={`answer_${answer.id}`}
                                                                        {...register(`answer_${answer.id}`)}
                                                                        defaultValue={answer.count}
                                                                        className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-xs/6"
                                                                    />
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                question.answer && question.answer.map((answer: any, answerId: any) => (
                                                    <div key={answerId} className="relative w-full">
                                                        <label
                                                            htmlFor={`select-${answer.id}`}
                                                            className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                        >
                                                            Chọn loại câu hỏi tự luận

                                                            <span className="text-xs text-gray-500">
                                                                &nbsp; (Nếu chọn "other-Bỏ qua không điền" thì bạn phải "tắt bắt buộc điền trên Google Form")
                                                            </span>
                                                        </label>

                                                        <select
                                                            className="js-answer-select block w-full rounded-md bg-white px-3 py-3 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-primary-600 sm:text-xs/6"
                                                            id={`select-${answer.id}`}
                                                            {...register(`answer_${answer.id}`)}
                                                            defaultValue={answer.count}
                                                        >
                                                            {answer.options && answer.options.map((option: any, optionId: any) => (
                                                                <option key={optionId} value={option}>{option}</option>
                                                            ))}
                                                        </select>

                                                        <textarea
                                                            className="mt-3 w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 text-xs hidden custom-input"
                                                            id={`custom-${answer.id}`}
                                                            {...register(`custom-${answer.id}`)}
                                                            defaultValue={answer.data}
                                                            rows={4}
                                                            placeholder="Nhập mỗi dòng 1 câu trả lời (ấn enter để xuống dòng). Không để dòng trống. Tool sẽ điền lặp lại ngẫu nhiên nếu số lượng không đủ."
                                                        />
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Lưu lại và tiếp tục
                            </button>

                            {isSaved && !chatErrors.some(error => error.type === 'error') && (
                                <div className="animate-fade-in bg-green-50 border-l-4 border-green-600 p-6 mb-6 rounded-lg shadow-sm flex flex-col items-center text-center">
                                    <div className="flex items-center gap-2 mb-3">
                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-green-800 font-semibold text-lg">Đã lưu dữ liệu thành công</span>
                                    </div>


                                    <CreateOrderForm
                                        orderType={ORDER_TYPE.DATA_MODEL}
                                        disabledDays={disabledDays}
                                        scheduleEnabled={scheduleEnabled}
                                        startTime={startTime}
                                        endTime={endTime}
                                        userCredit={user?.credit || 0}
                                        numRequest={numRequest}
                                        delayType={delayValue}
                                        formId={dataForm?.form?.id}
                                        formName={dataForm?.form?.name}
                                        bankInfo={bankInfo}
                                        showBackButton={false}
                                        modelMode={modelMode}
                                        specificStartDate={specificStartDate}
                                        specificEndDate={specificEndDate}
                                        specificDailySchedules={specificDailySchedules}
                                        onSpecificStartDateChange={(value) => setSpecificStartDate(value)}
                                        onSpecificEndDateChange={(value) => setSpecificEndDate(value)}
                                        onSpecificDailySchedulesChange={(value) => setSpecificDailySchedules(value)}
                                        onNumRequestChange={(value) => {
                                            setNumRequest(value);
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
                                        className="bg-white p-10 rounded-lg shadow-sm border border-gray-100 max-w-2xl"
                                    />

                                    <button
                                        type="submit"
                                        onClick={() => {
                                            onSubmitOrder();
                                        }}
                                        className={`w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                                ${(user?.credit || 0) < numRequest || submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        disabled={(user?.credit || 0) < numRequest || submitDisabled}
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
                            )}
                            <div className="w-full mt-4 flex justify-center items-center">

                                {isSaved && chatErrors.some(error => error.type === 'error') && (
                                    <div className="w-full max-w-md mt-4 text-red-800 bg-red-50 px-5 py-4 rounded-lg border border-red-200 shadow flex flex-col items-center animate-shake" role="alert">
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
                                        <button
                                            onClick={() => onSubmitOrder()}
                                            className="inline-flex items-center px-4 py-2 text-sm bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                                        >
                                            Vẫn chạy điền form
                                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
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