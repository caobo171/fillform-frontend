'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { RawForm } from '@/store/types';
import Fetch from '@/lib/core/fetch/Fetch';
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from '@/core/Constants';
import { Toast } from '@/services/Toast';
import { useMe, useMyBankInfo } from '@/hooks/user';
import { useFormById } from '@/hooks/form';
import LoadingAbsolute from '@/components/loading';
import { usePostHog } from 'posthog-js/react';

interface ApiResponse {
  code: number;
  data: {
    _id: string;
  };
  message?: string;
}

interface BankInfo {
  number: string;
  name: string;
  qr_link: string;
  message_credit: string;
}

interface FormData {
  form: {
    _id: string;
    name: string;
    description?: string;
  };
  config: any;
  latest_form_questions: any[];
}

const MAX_EXPECTED_OUTCOME_LENGTH = 1000;
const AI_PREMIUM = 100;

export default function FormAIOrder() {
  const params = useParams();
  const { data: formData, isLoading: isLoadingForm } = useFormById(params.id as string) as { data: FormData | undefined; isLoading: boolean };
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

  const handleSubmit = async () => {
    if (!formData || !numRequest || parseInt(numRequest) <= 0) {
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
      const response = await Fetch.post<ApiResponse>('/api/orders', {
        formId: formData.form._id,
        type: 'ai',
        numRequest: parseInt(numRequest),
        expectedOutcome,
        delayType: parseInt(delayType),
        email,
        total
      });

      if (response.data.code === Code.SUCCESS) {
        posthog?.capture('create_ai_order', {
          formId: formData.form._id,
          numRequest: parseInt(numRequest),
          expectedOutcome,
          delayType: parseInt(delayType),
          total
        });

        Toast.success('Đặt đơn thành công');
        router.push(`/order/detail/${response.data.data._id}`);
      } else {
        Toast.error(response.data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      Toast.error('Có lỗi xảy ra');
    }

    setIsLoading(false);
  };

  if (isLoadingForm || !formData) return <LoadingAbsolute />;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Điền form bằng AI Agent</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Thông tin form</h2>
        <p className="mb-2"><span className="font-medium">Tên form:</span> {formData.form.name}</p>
        <p className="mb-4"><span className="font-medium">Mô tả:</span> {formData.form.description || 'Không có mô tả'}</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Cấu hình AI Agent</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Số lượng khảo sát cần điền
          </label>
          <input
            type="number"
            min="1"
            value={numRequest}
            onChange={(e) => setNumRequest(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500"
            placeholder="Nhập số lượng"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Kết quả mong muốn
          </label>
          <textarea
            value={expectedOutcome}
            onChange={(e) => setExpectedOutcome(e.target.value)}
            className="w-full p-3 border rounded focus:ring-2 focus:ring-primary-500 min-h-[120px]"
            placeholder="Mô tả kết quả bạn mong muốn đạt được từ khảo sát này. Ví dụ: Xu hướng tiêu cực về chất lượng dịch vụ, hoặc phản hồi tích cực về trải nghiệm sản phẩm..."
            maxLength={MAX_EXPECTED_OUTCOME_LENGTH}
          />
          <p className="mt-2 text-sm text-gray-600 flex justify-between">
            <span>Mô tả càng chi tiết, AI càng hiểu rõ mong muốn của bạn</span>
            <span>{expectedOutcome.length}/{MAX_EXPECTED_OUTCOME_LENGTH}</span>
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Điền rải random như người thật
          </label>
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

        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">
            Email nhận báo cáo phân tích
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-primary-500"
            placeholder="Nhập email của bạn"
          />
          <p className="mt-2 text-sm text-gray-600">
            AI Agent sẽ gửi báo cáo chi tiết về lý do chọn các câu trả lời qua email này
          </p>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-medium">Tổng tiền:</span>
              <span className="text-xl font-bold text-primary-600">
                {total.toLocaleString()}đ
              </span>
            </div>

            {message && (
              <div className={`p-3 rounded ${!hasEnoughCredit ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                {message}
              </div>
            )}

            {!hasEnoughCredit && bankInfo?.data && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Thông tin chuyển khoản:</h3>
                  <p>Số tài khoản: {bankInfo.data.number}</p>
                  <p>Ngân hàng: {bankInfo.data.name}</p>
                  <p>Chủ tài khoản: {bankInfo.data.name}</p>
                  <p className="mt-2 text-sm text-gray-600">
                    Nội dung chuyển khoản: {formData.form.name} - {numRequest} khảo sát
                  </p>
                </div>
                {bankInfo.data.qr_link && (
                  <div>
                    <h3 className="font-medium mb-2">Mã QR:</h3>
                    <img src={bankInfo.data.qr_link} alt="QR Code" className="max-w-[200px] mx-auto" />
                  </div>
                )}
              </div>


            )}
          </div>


          <button
            onClick={handleSubmit}
            disabled={submitDisabled || isLoading}
            className="w-full py-3 px-4 rounded-lg font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Đang xử lý...' : 'Đặt đơn ngay'}
          </button>
        </div>
      </div>
    </div>
  );
}
