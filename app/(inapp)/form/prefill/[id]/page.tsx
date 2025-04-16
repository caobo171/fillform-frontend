"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useFormById } from "@/hooks/form";
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from "@/core/Constants";
import { MeHook } from "@/store/me/hooks";
import { useMe, useMyBankInfo } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Toast } from '@/services/Toast';
import LoadingAbsolute from '@/components/loading';
import { FormTypeNavigation } from "../../_components/FormTypeNavigation";

interface FormData {
    slug: string;
    urlMain: string;
    name: string;
    urlData: string;
    loaddata?: Array<{
        id: string;
        question: string;
        description: string;
        field: string;
        fields: Array<{
            id: string;
            value: string;
        }>;
    }>;
}

interface User {
    credit: number;
}

interface Field {
    id: string;
    value: string;
}

interface PrefillPageProps {
    params: {
        slug: string;
    };
}

export default function FormPrefill() {
    const router = useRouter();
    const { id } = useParams();

    const { data: formData, isLoading: isLoadingForm } = useFormById(id as string);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fields, setFields] = useState<Field[] | null>(null);
    const [prefillForm, setPrefillForm] = useState<any>(null);
    const [prefillData, setPrefillData] = useState<any>({});
    const [urlData, setUrlData] = useState('');
    const [submitDisabled, setSubmitDisabled] = useState(false);
    const { data: user } = useMe();
    const bankInfo = useMyBankInfo();

    const { register, handleSubmit, control, watch, setValue, reset } = useForm();


    const onCheckData = async (event: any) => {
        setIsLoading(true);
        event.preventDefault();
        // This would be your API call to check the data
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, message: string, fields: any, prefillData: any, form: any }>('/api/form/get.prefill', {
                data_url: urlData,
                id: formData?.form?.id
            });

            setFields(res.data?.fields);
            setPrefillData(res.data?.prefillData);
            setPrefillForm(res.data?.form);
            setError('');

            // Set form values for each question in the form data
            if (res.data?.form?.loaddata) {
                // Reset any previous form values first
                reset();
                
                // Set default values for each question based on the form data
                res.data.form.loaddata.forEach((item: any) => {
                    if (item.id && item.field) {
                        setValue(`question_${item.id}`, item.field);
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
        setIsLoading(true);
        setSubmitDisabled(true);
        try {
            const response = await Fetch.postWithAccessToken<{ code: number, message: string }>('/api/order/create.prefill.run', {
                form_id: formData?.form?.id,
                ...data,
                delay_type: data.delay,
                num_request: data.num_request,
                data_url: urlData,

            });

            if (response.data?.code == Code.SUCCESS) {
                Toast.success('Đã tạo yêu cầu điền form thành công!');
                router.push(`/`);
            } else {
                Toast.error('Đã xảy ra lỗi, vui lòng thử lại!');
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


    // Watch for delay value changes
    const delayValue = watch("delay", 0);
    const numRequest = prefillData.length;

    // Calculate total and delay message
    const calculatePriceAndDelay = () => {
        let pricePerAnswer = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
        if (parseInt(delayValue) === OPTIONS_DELAY_ENUM.SHORT_DELAY) pricePerAnswer = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price;
        else if (parseInt(delayValue) === OPTIONS_DELAY_ENUM.STANDARD_DELAY) pricePerAnswer = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price;
        else if (parseInt(delayValue) === OPTIONS_DELAY_ENUM.LONG_DELAY) pricePerAnswer = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price;

        const total = numRequest * pricePerAnswer;
        const insufficientFunds = total > (user?.credit || 0);

        let delayNote = "";
        switch (parseInt(delayValue)) {
            case OPTIONS_DELAY_ENUM.NO_DELAY:
                delayNote = `Không có điền rải dãn cách. Đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price} VND / 1 mẫu trả lời. Kết quả lên ngay tức thì (Không bị giới hạn thời gian, khoảng mỗi mẫu cách nhau khoảng 1s).`;
                break;
            case OPTIONS_DELAY_ENUM.SHORT_DELAY:
                delayNote = `Bill điền rải ngắn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 5 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 2 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            case OPTIONS_DELAY_ENUM.STANDARD_DELAY:
                delayNote = `Bill điền rải tiêu chuẩn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 10 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 12 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            case OPTIONS_DELAY_ENUM.LONG_DELAY:
                delayNote = `Bill điền rải dài có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price} VND / 1 mẫu trả lời. Rải random từ <b>1 đến 20 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 24 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
                break;
            default:
                delayNote = "⚠️ Lựa chọn điền rải không hợp lệ!";
        }

        return {
            pricePerAnswer,
            total,
            insufficientFunds,
            delayNote,
            message: insufficientFunds
                ? 'KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ'
                : `Bạn xác nhận sẽ buff ${numRequest} câu trả lời cho form này.`
        };
    };

    const { pricePerAnswer, total, insufficientFunds, delayNote, message } = calculatePriceAndDelay();

    if (isLoadingForm || !formData) {
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
                        
                        <FormTypeNavigation formId={formData?.form?.id} type={'prefill'} />

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
                                    <p>Vui lòng xem kỹ hướng dẫn bên dưới trước khi thực hiện</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p>Video hướng dẫn chi tiết: <a href="https://www.youtube.com/watch?v=5UM5Q2-jsBI" className="text-primary-600 font-medium hover:underline">Xem tại đây</a></p>
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
                                            value={formData?.form?.urlMain}
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
                                            value={formData?.form?.name}
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
                                                    <div className="md:w-2/5 mb-3 md:mb-0">
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
                                                                    <option key={field.value} value={field.value}>
                                                                        {field.value}
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
                                                    {(user?.credit || 0).toLocaleString()} <span className="text-xs font-normal text-gray-500">VND</span>
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
                                                <input
                                                    type="number"
                                                    readOnly
                                                    className="bg-white rounded-md px-4 py-2 border border-gray-200 text-primary-700 font-semibold w-40"
                                                    value={numRequest}
                                                    {...register("num_request")}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 gap-x-8 mb-4">
                                            <div className="flex items-center md:justify-end text-gray-700 font-medium">
                                                Điền rải random như người thật
                                            </div>
                                            <div className="col-span-2">
                                                <select
                                                    className="block w-full rounded-md bg-white px-3 py-2.5 text-xs text-gray-700 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent"
                                                    {...register("delay")}
                                                >
                                                    <option value="0">Không cần điền rải</option>
                                                    <option value="1">Điền giãn cách ngắn</option>
                                                    <option value="2">Điền giãn cách tiêu chuẩn</option>
                                                    <option value="3">Điền giãn cách dài</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 my-6">
                                        <h3 className="text-xl font-bold">TỔNG CỘNG : {total.toLocaleString()} VND</h3>
                                        <p className="text-sm text-left w-full" dangerouslySetInnerHTML={{ __html: delayNote }}></p>
                                        
                                        {insufficientFunds && (
                                            <div className="mt-4 p-4 bg-white rounded-lg">
                                                <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-medium">
                                                    ❌ KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ!
                                                </div>
                                                <h4 className="text-lg font-bold mb-3 text-center">Nạp thêm {(total - (user?.credit || 0)).toLocaleString()} VND để tiếp tục</h4>
                                                
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

                                                    <div className="flex items-start">
                                                        <span className="w-1/3 font-medium text-right pr-3">Mã QR:</span>
                                                        <Image
                                                            src={bankInfo?.data?.qr_link || ""}
                                                            alt="QRCode"
                                                            width={200}
                                                            height={200}
                                                            className="w-[200px] h-auto"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className={`w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                        ${insufficientFunds || submitDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={insufficientFunds || submitDisabled}
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Bắt đầu điền form
                                </button>
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
        </>
    );
}