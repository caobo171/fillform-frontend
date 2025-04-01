"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useFormById } from "@/hooks/form";
import { Code, OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from "@/core/Constants";
import { MeHook } from "@/store/me/hooks";
import { useMe } from "@/hooks/user";
import Fetch from "@/lib/core/fetch/Fetch";
import { Toast } from "@/services/Toast";
import LoadingAbsolute from "@/components/loading";

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
    const { data: user } = useMe()

    const { register, handleSubmit, control, watch, setValue } = useForm();


    const onCheckData = async (event: any) => {
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


            // And update formData with loaddata
        } catch (err) {
            setError("Error checking data. Please verify your Google Sheet link.");
        }
    };

    const onSubmitPrefill = async (data: any) => {
        // This would be your API call to run the prefill
        console.log("Running prefill with data:", data);
        setIsLoading(true);
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

    if (!formData) return <LoadingAbsolute />;

    return (
        <section className="py-12 bg-gray-50">
            <div className="container mx-auto px-4 text-center">
                <div className="mb-8">
                    {(isLoading || isLoadingForm) ? <LoadingAbsolute /> : <></>}
                    <h2 className="text-2xl font-bold mb-4">Điền theo data có trước</h2>
                    <div className="flex flex-wrap justify-center gap-2 mb-4">
                        <Link
                            href={`/form/${formData?.form.id}`}
                            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50"
                        >
                            Điền theo tỉ lệ mong muốn
                        </Link>
                        <Link
                            href="#"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Điền theo data có trước
                        </Link>
                    </div>
                    <p className="mb-1">Hãy nhập link Google Sheet bộ data có sẵn của bạn vào ô dưới dây</p>
                    <p className="mb-1">Hãy xem kĩ hướng dẫn dưới đây bạn nhé</p>
                    <p>Video hướng dẫn chi tiết: <a href="https://www.youtube.com/watch?v=5UM5Q2-jsBI" className="text-blue-600 hover:underline">https://www.youtube.com/watch?v=5UM5Q2-jsBI</a></p>
                </div>
                <form onSubmit={(e) => onCheckData(e)} className=" mx-auto mb-8">
                    <div className="mb-4">
                        <div className="flex mb-3 w-full">
                            <span className="w-1/3 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-l">Link Form</span>
                            <input
                                type="text"
                                readOnly
                                className="w-2/3 border border-gray-300 px-4 py-2 rounded-r bg-gray-50"
                                value={formData?.form?.urlMain}
                            />
                        </div>
                        <div className="flex mb-3 w-full">
                            <span className="w-1/3 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-l">Tên Form</span>
                            <input
                                type="text"
                                readOnly
                                className="w-2/3 border border-gray-300 px-4 py-2 rounded-r bg-gray-50"
                                value={formData?.form?.name}
                            />
                        </div>
                        <div className="flex mb-3 w-full">
                            <span className="w-1/3 bg-gray-100 border border-gray-300 text-gray-700 px-4 py-2 rounded-l">Link Data của bạn</span>
                            <input
                                type="text"
                                className="w-2/3 border border-gray-300 px-4 py-2 rounded-r"
                                value={urlData}
                                onChange={(e) => setUrlData(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Kiểm tra dữ liệu
                    </button>
                </form>

                {error && (
                    <div className="bg-blue-100 border border-blue-200 text-blue-800 p-4 rounded mb-6">
                        {error}
                    </div>
                )}

                {fields ? (
                    <form onSubmit={handleSubmit(onSubmitPrefill)} className=" mx-auto text-left">
                        <div className="bg-gray-100 bg-opacity-15 p-4 rounded mb-6">
                            {prefillForm?.loaddata && prefillForm?.loaddata?.map((data: any, index: any) => {
                                return (
                                    <div key={index} className="p-2 mb-2 border-b border-gray-200">
                                        <div className="flex flex-col md:flex-row gap-4">
                                            <div className="md:w-1/2">
                                                <label className="font-bold block mb-1">{data.question}</label>
                                                <span className="text-sm text-gray-600 block">{data.description}</span>
                                            </div>
                                            <div className="md:w-1/2">
                                                <div className="flex flex-col">
                                                    <label className="bg-gray-100 p-2 border border-gray-300 rounded-t text-sm">
                                                        Chọn cột để liên kết dữ liệu
                                                    </label>
                                                    <select
                                                        {...register('question_' + data.id, { value: data.field })}
                                                        className="border border-gray-300 p-2 rounded-b text-sm"
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
                                )
                            })}

                            <h3 className="text-xl font-bold mt-8 mb-4">TẠO YÊU CẦU ĐIỀN FORM</h3>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <label className="col-span-2 md:col-span-1 flex items-center">Số dư tài khoản</label>
                                <div className="col-span-1 md:col-span-2">
                                    <input
                                        type="text"
                                        readOnly
                                        className="w-full bg-transparent"
                                        value={(user?.credit || 0).toLocaleString()}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <label className="col-span-2 md:col-span-1 flex items-center">Đơn giá mỗi câu trả lời (VND)</label>
                                <div className="col-span-1 md:col-span-2">
                                    <p>{pricePerAnswer.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <label className="col-span-2 md:col-span-1 flex items-center">Số lượng câu trả lời cần tăng</label>
                                <div className="col-span-1 md:col-span-2">
                                    <input
                                        type="number"
                                        readOnly
                                        className="w-full bg-transparent"
                                        value={numRequest}
                                        {...register("num_request")}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <label className="col-span-2 md:col-span-1 flex items-center">Điền rải random như người thật</label>
                                <div className="col-span-1 md:col-span-2">
                                    <select
                                        className="w-full border border-gray-300 p-2 rounded"
                                        {...register("delay")}
                                    >
                                        <option value="0">Không cần điền rải</option>
                                        <option value="1">Điền giãn cách ngắn</option>
                                        <option value="2">Điền giãn cách tiêu chuẩn</option>
                                        <option value="3">Điền giãn cách dài</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded mb-6">
                                <h3 className="text-xl font-bold mb-2">TỔNG CỘNG : {total.toLocaleString()} VND</h3>
                                <p className="mb-2">{message}</p>
                                <p className="text-sm" dangerouslySetInnerHTML={{ __html: delayNote }}></p>
                            </div>

                            <button
                                type="submit"
                                className={`w-full py-3 rounded font-medium ${insufficientFunds
                                    ? 'bg-gray-400 text-white cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                disabled={insufficientFunds}
                            >
                                Bắt đầu điền form
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="mx-auto">
                        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="text-left">
                                <p className="mb-4">
                                    <strong>Note: </strong> Nếu bạn <strong>thao tác lần đầu</strong>, hãy tạo bản sao cho form của mình và thực hiện trên bản sao trước nhé!
                                </p>
                                <h1 className="text-2xl font-bold mb-4">Hướng Dẫn</h1>
                                <p className="font-bold mb-2">Bước 1: Chuẩn hoá dữ liệu</p>
                                <p className="mb-4">
                                    - Dòng đầu tiên là label cột dữ liệu, các cột nên sắp xếp theo thứ tự câu hỏi trong Google Form.<br />
                                    - Trắc nhiệm (chọn 1 đáp án): Nhập <strong>số thứ tự</strong> của đáp án trong form, bắt đầu từ 1<br />
                                    - Trắc nhiệm (chọn nhiều đáp án): Nhập số tự tự đáp án ngăn cách bằng //, ví dụ: 1//3//4<br />
                                    - Tự luận: Nhập trực tiếp đáp án, cố hạn chế dấu , ; và xuống dòng<br />
                                    <strong>Data mẫu (thông tin cá nhân đều là thông tin ảo):</strong><br />
                                    https://docs.google.com/spreadsheets/d/1dqZwuXIQJ1VnnRGsVU5eS40zN1wB2Q9U/edit<br /><br />
                                    Bạn có thể sử dụng tính năng <strong>mã hóa data</strong> để có data chuẩn hóa nhanh chóng (Hướng dẫn tại link video đầu trang).
                                </p>
                            </div>
                            <div>
                                <Image
                                    src="/static/img/prefill-s1.png"
                                    alt="Fillform Step 1"
                                    width={500}
                                    height={300}
                                    className="w-full rounded shadow"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="text-left">
                                <p className="font-bold mb-2">Bước 2: Căn sửa data</p>
                                <p className="mb-4">
                                    - Chọn toàn bộ <strong>phần data trong câu hỏi chọn nhiều đáp án</strong> và chuyển về định dạng kí tự <strong>"Plain Text".</strong><br />
                                    - Chỉnh sửa, thêm xóa dữ liệu theo điều hướng session phù hợp (nếu có).
                                </p>
                            </div>
                            <div>
                                <Image
                                    src="/static/img/prefill-s3.png"
                                    alt="Fillform Step 2"
                                    width={500}
                                    height={300}
                                    className="w-full rounded shadow"
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 items-center mb-8">
                            <div className="text-left">
                                <p className="font-bold mb-2">Bước 3: Copy đường dẫn edit của data sheet Google</p>
                                <p className="mb-4">
                                    - Tải bộ data excel của bạn lên <strong>google sheet</strong>.<br />
                                    - Mở <strong>quyền truy cập edit</strong> cho file này.<br />
                                    - Copy đường dẫn edit của sheet vào ô phía trên, <strong>phải có đuôi /edit</strong>.<br />
                                    - Ấn <strong>Kiểm tra dữ liệu</strong>, sau đó chỉnh sửa liên kết dữ liệu với câu hỏi
                                </p>
                            </div>
                            <div>
                                <Image
                                    src="/static/img/prefill-s2.png"
                                    alt="Fillform Step 3"
                                    width={500}
                                    height={300}
                                    className="w-full rounded shadow"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}