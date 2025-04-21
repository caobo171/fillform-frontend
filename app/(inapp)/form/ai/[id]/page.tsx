'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { RawForm } from '@/store/types';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import { useMe, useMyBankInfo } from '@/hooks/user';
import { useFormById } from '@/hooks/form';
import LoadingAbsolute from '@/components/loading';
import { usePostHog } from 'posthog-js/react';
import { FormTypeNavigation } from '../../_components/FormTypeNavigation';
import WarningChatBox from '../../_components/WarningChatBox';
import { Helper } from '@/services/Helper';

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


const MAX_EXPECTED_OUTCOME_LENGTH = 1000;
const AI_PREMIUM = 100;

export default function FormAIOrder() {
  const params = useParams();
  const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(params.id as string);
  const [isLoading, setIsLoading] = useState(false);
  const me = useMe();
  const bankInfo = useMyBankInfo();
  const posthog = usePostHog();
  const router = useRouter();

  const [numRequest, setNumRequest] = useState('');
  const [expectedOutcome, setExpectedOutcome] = useState('');
  const [delayType, setDelayType] = useState('0');
  const [email, setEmail] = useState(me?.data?.email || '');
  const [message, setMessage] = useState('');
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [hasEnoughCredit, setHasEnoughCredit] = useState(true);
  const [chatOpen, setChatOpen] = useState<boolean>(true);
  const [chatErrors, setChatErrors] = useState<ChatError[]>([]);
  const [reloadEvent, setReloadEvent] = useState(false);

  const prices = useMemo(() => ({
    noDelay: OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price + AI_PREMIUM,
    shortDelay: OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price + AI_PREMIUM,
    standardDelay: OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price + AI_PREMIUM,
    longDelay: OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price + AI_PREMIUM,
  }), []);

  const pricePerAnswer = useMemo(() => {
    const delayPrices = {
      [OPTIONS_DELAY_ENUM.SHORT_DELAY]: prices.shortDelay,
      [OPTIONS_DELAY_ENUM.STANDARD_DELAY]: prices.standardDelay,
      [OPTIONS_DELAY_ENUM.LONG_DELAY]: prices.longDelay,
    };
    return delayPrices[delayType as keyof typeof delayPrices] || prices.noDelay;
  }, [delayType, prices]);

  const total = useMemo(() => (parseInt(numRequest) || 0) * pricePerAnswer, [numRequest, pricePerAnswer]);

  useMemo(() => {
    const userCredit = me.data?.credit || 0;
    const num = parseInt(numRequest) || 0;

    if (total > userCredit) {
      setHasEnoughCredit(false);
      setMessage('KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ!');
      setSubmitDisabled(true);
    } else if (num > 0) {
      setHasEnoughCredit(true);
      setSubmitDisabled(false);
      setMessage(`Bạn xác nhận sẽ điền ${num} câu trả lời cho form này bằng AI Agent.`);
    } else {
      setHasEnoughCredit(true);
      setMessage('');
      setSubmitDisabled(true);
    }
  }, [total, me.data?.credit, numRequest]);

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
        addChatError(chatErrors, `Tuyệt! Google form này setting OK. Hãy config tỉ lệ nhé.`, `00005`, "note");
      }
    }
  };

  useEffect(() => {
    if (dataForm?.form) {
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

  const handleSubmit = async () => {
    if (!dataForm || !numRequest || parseInt(numRequest) <= 0) {
      Toast.error('Vui lòng nhập số lượng khảo sát');
      return;
    }
    if (!expectedOutcome) {
      Toast.error('Vui lòng nhập kết quả mong muốn');
      return;
    }
    if (expectedOutcome.length > MAX_EXPECTED_OUTCOME_LENGTH) {
      Toast.error(`Kết quả mong muốn không được vượt quá ${MAX_EXPECTED_OUTCOME_LENGTH} từ`);
      return;
    }
    if (!email) {
      Toast.error('Vui lòng nhập email để nhận báo cáo phân tích');
      return;
    }

    setIsLoading(true);

    try {
      const response = await Fetch.postWithAccessToken<ApiResponse>('/api/order/create.agent.run', {
        form_id: dataForm.form.id,
        num_request: parseInt(numRequest),
        expected_outcome: expectedOutcome,
        delay_type: parseInt(delayType),
        email,
      });

      if (response.data.code === Code.SUCCESS) {
        posthog?.capture('create_ai_order', {
          formId: dataForm.form.id,
          numRequest: parseInt(numRequest),
          expectedOutcome,
          delayType: parseInt(delayType),
        });

        Toast.success('Đặt đơn thành công');
      } else {
        Toast.error(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Toast.error('Có lỗi xảy ra');
    }

    setIsLoading(false);
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
              <div className="space-y-4 text-xs text-gray-700">
                <div className="flex items-center gap-2">
                  <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>Điền form tự động bằng AI Agent thông minh, tạo ra dữ liệu đa dạng và chân thực</p>
                </div>
                <div className="flex items-start gap-2">
                  <svg className="flex-shrink-0 h-5 w-5 text-primary-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p>Bạn có thể điều chỉnh kết quả mong muốn và tốc độ điền form theo nhu cầu</p>
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
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
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
                      value={dataForm?.form?.urlMain || ''}
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

              </div>
            </div>
          </div>

          <div className="container mx-auto">
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="flex-shrink-0 h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">CẤU HÌNH AI AGENT</h3>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label htmlFor="numRequest" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                      Số lượng khảo sát cần điền
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                        </svg>
                      </span>
                      <input
                        type="number"
                        id="numRequest"
                        min="1"
                        value={numRequest}
                        onChange={(e) => setNumRequest(e.target.value)}
                        className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Nhập số lượng khảo sát cần điền"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label htmlFor="expectedOutcome" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                      Kết quả mong muốn
                    </label>
                    <textarea
                      id="expectedOutcome"
                      value={expectedOutcome}
                      onChange={(e) => setExpectedOutcome(e.target.value)}
                      className="w-full p-3 border rounded-md border-gray-300 focus:ring-2 focus:ring-primary-600 focus:border-transparent min-h-[120px]"
                      placeholder="Mô tả kết quả bạn mong muốn đạt được từ khảo sát này. Ví dụ: Xu hướng tiêu cực về chất lượng dịch vụ, hoặc phản hồi tích cực về trải nghiệm sản phẩm..."
                      maxLength={MAX_EXPECTED_OUTCOME_LENGTH}
                    />
                    <p className="mt-2 text-xs text-gray-600 flex justify-between">
                      <span>Mô tả càng chi tiết, AI càng hiểu rõ mong muốn của bạn</span>
                      <span>{expectedOutcome.length}/{MAX_EXPECTED_OUTCOME_LENGTH}</span>
                    </p>
                  </div>

                  <div className="relative">
                    <label htmlFor="delay" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                      Điền rải random như người thật
                    </label>
                    <select
                      className="block w-full rounded-md bg-white px-3 py-2.5 text-xs text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
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

                  <div className="relative">
                    <label htmlFor="email" className="absolute -top-2 left-2 inline-block bg-white px-1 text-xs font-medium text-gray-600">
                      Email nhận báo cáo phân tích
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 text-gray-500 bg-gray-50 border border-r-0 border-gray-300 rounded-l-md">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                        placeholder="Nhập email của bạn"
                      />
                    </div>
                    <p className="mt-2 text-xs text-gray-600">
                      AI Agent sẽ gửi báo cáo chi tiết về lý do chọn các câu trả lời qua email này
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <svg className="flex-shrink-0 h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900">TẠO YÊU CẦU ĐIỀN FORM</h3>
                </div>

                <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 mb-4">
                    <div className="flex items-center md:justify-end text-gray-700 font-medium">
                      Số dư tài khoản
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="bg-white rounded-md px-4 py-2 border border-gray-200 text-primary-700 font-semibold w-40">
                        {(me.data?.credit || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">VND</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 mb-4">
                    <div className="flex items-center md:justify-end text-gray-700 font-medium">
                      Đơn giá mỗi câu trả lời
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="bg-white rounded-md px-4 py-2 border border-gray-200 text-primary-700 font-semibold">
                        {pricePerAnswer.toLocaleString()} <span className="text-xs font-normal text-gray-500">VND</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 mb-4">
                    <div className="flex items-center md:justify-end text-gray-700 font-medium">
                      Số lượng câu trả lời cần tăng
                    </div>
                    <div className="col-span-2 flex items-center">
                      <div className="bg-white rounded-md px-4 py-2 border border-gray-200 text-primary-700 font-semibold w-40">
                        {numRequest ? parseInt(numRequest) : 0}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 my-6">
                  <h3 className="text-xl font-bold">TỔNG CỘNG : {total.toLocaleString()} VND</h3>

                  {message && (
                    <div className={`mt-3 p-3 rounded-lg ${!hasEnoughCredit ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-800'} text-center font-medium`}>
                      {message}
                    </div>
                  )}

                  {!hasEnoughCredit && bankInfo?.data && (
                    <div className="mt-4 p-4 bg-white rounded-lg">
                      <h4 className="text-lg font-bold mb-3 text-center">Nạp thêm {(total - (me.data?.credit || 0)).toLocaleString()} VND để tiếp tục</h4>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <span className="w-1/3 font-medium text-right pr-3">Tên NH:</span>
                          <span>{bankInfo?.data?.name}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-1/3 font-medium text-right pr-3">STK:</span>
                          <span>{bankInfo?.data?.number}</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-1/3 font-medium text-right pr-3">Tên TK:</span>
                          <span>VUONG TIEN DAT</span>
                        </div>

                        <div className="flex items-center">
                          <span className="w-1/3 font-medium text-right pr-3">Nội dung CK:</span>
                          <span>{bankInfo?.data?.message_credit}</span>
                        </div>

                        {bankInfo.data.qr_link && (
                          <div className="flex items-start">
                            <span className="w-1/3 font-medium text-right pr-3">Mã QR:</span>
                            <Image
                              src={bankInfo.data.qr_link}
                              alt="QRCode"
                              width={200}
                              height={200}
                              className="w-[200px] h-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSubmit}
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
