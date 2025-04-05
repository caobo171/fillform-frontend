'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import LoadingAbsolute from '@/components/loading'

interface FormData {
    formid?: string
    msg?: string
    form_link?: string
}

export default function FormCreate() {

    const [form_link, setFormLink] = useState<string>('');
    const [msg, setMsg] = useState<string>('');
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);

    const handleCreateForm = async () => {

        if (!form_link) {
            setMsg('Vui lòng nhập đường dẫn edit form!');
            return;
        }

        setLoading(true);

        try {
            const res: any = await Fetch.postWithAccessToken('/api/form/create', {
                form_link,
            });

            console.log(res);
            if (res.data?.form){
                Toast.success('Tạo form thành công!');
                router.push(`/form/${res.data?.form?.id}`);
            }
        } catch (e) {
            setMsg('Đã xảy ra lỗi!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="py-16">
            <div className="container mx-auto px-4 text-center">
                {/* Header */}
                <div className="mb-4">
                    <h2 className="text-3xl font-bold mb-4">Tạo Form mới</h2>
                    <p className="text-gray-600">
                        Nhập link edit form của bạn vào ô dưới đây <br />
                        Hãy đọc kĩ hướng dẫn để tránh sai sót
                    </p>
                </div>

                {loading ? <LoadingAbsolute /> : <></>}

                {/* Form Section */}
                <div className="mx-auto text-left">
                    <div className="mb-6">
                        <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-4 py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 w-[30%]">
                                Điền Edit Link Form
                            </span>
                            <input
                                type="text"
                                className="flex-1 block w-full rounded-r-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 p-2"
                                id="urlMain"
                                name="urlMain"
                                value={form_link}
                                onChange={(e) => setFormLink(e.target.value)}
                            />
                        </div>
                    </div>
                    <button
                        onClick={handleCreateForm}
                        className="bg-blue-600 text-center text-white px-6 py-2 w-full rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Tạo ngay
                    </button>


                    {/* Alert Message */}
                    {msg && (
                        <div className="mt-4">
                            <div className="bg-blue-100 border border-blue-200 text-blue-700 px-4 py-3 rounded text-center">
                                {msg}
                            </div>
                        </div>
                    )}
                </div>

                {/* Guide Sections */}
                <div className="mt-16 space-y-16">
                    {/* Step 1 */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-left">
                            <div className="mb-4">
                                <p className="mb-4">
                                    <strong className="text-red-600">Note: </strong>
                                    Nếu bạn <strong>thao tác lần đầu</strong>, hãy tạo bản sao cho form của mình và thực hiện trên bản sao trước nhé!
                                </p>
                                <h1 className="text-2xl font-bold mb-4">Hướng Dẫn</h1>
                                <p className="font-bold mb-2">Bước 1: Copy đường dẫn edit</p>
                                <p className="mb-2">
                                    Copy đường dẫn edit của form vào ô phía trên. Đường dẫn edit lấy từ trang chỉnh sửa form của bạn,
                                    <strong> phải có đuôi /edit</strong>. Ví dụ:
                                </p>
                                <p className="text-xs">
                                    https://docs.google.com/forms/d/1IkrTNv9VlSHbDbFx_tnRXXarN1BaNkzHr9VHtBamkRw/edit
                                </p>
                            </div>
                        </div>
                        <div>
                            <Image
                                src="/static/img/guide-s1.png"
                                alt="Fillform Step 1"
                                width={600}
                                height={400}
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Step 2 */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-left">
                            <p className="font-bold mb-2">Bước 2: Mở quyền truy cập form và xuất bản form</p>
                            <p>
                                Xuất bản form và mở quyền edit cho tất cả các đối tượng.
                                <strong> Bạn chỉ cần mở quyền tại bước này</strong>,
                                sau khi bạn nhấn "Tạo ngay" và hệ thống lưu dữ liệu thành công, bạn có thể tắt quyền truy cập.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Image
                                src="/static/img/guide-s21.png"
                                alt="Fillform Step 2.1"
                                width={300}
                                height={200}
                                className="w-full rounded-lg shadow-lg"
                            />
                            <Image
                                src="/static/img/guide-s22.png"
                                alt="Fillform Step 2.2"
                                width={300}
                                height={200}
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Step 3 */}
                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <div className="text-left">
                            <p className="font-bold mb-2">Bước 3: Cấu hình form</p>
                            <p className="mb-4">
                                Bạn lưu ý Form <strong>phải tắt thu thập email</strong>,
                                <strong>tắt cho phép chỉnh sửa câu trả lời</strong> và
                                <strong>phải tắt mỗi mail chỉ điền 1 lần</strong>.
                                Hãy cấu hình form như hình bên nhé!
                            </p>
                            <p>
                                Tất cả các vấn đề trên, FillForm đều có thể xử lí, nhưng sẽ cần thao tác của chuyên viên.
                                Nếu cần hỗ trợ, hay bất kì lỗi nào trong khi thao tác, bạn hãy liên hệ{' '}
                                <a
                                    href="https://www.facebook.com/fillformvn"
                                    className="text-blue-600 hover:underline"
                                >
                                    FillForm - Điền form tự động
                                </a> nhé!
                            </p>
                        </div>
                        <div>
                            <Image
                                src="/static/img/guide-s3.png"
                                alt="Fillform Step 3"
                                width={600}
                                height={400}
                                className="w-full rounded-lg shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}