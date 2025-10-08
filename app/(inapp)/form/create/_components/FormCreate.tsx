'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Controller, useForm } from 'react-hook-form'
import { XCircle } from 'lucide-react'
import { z } from 'zod'

import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import LoadingAbsolute from '@/components/loading'
import { Button, Input } from '@/components/common'
import { FormItem, InlineFormItem } from '@/components/form/FormItem'
import Meta from '@/components/ui/Meta'

const formCreateSchema = z.object({
    form_link: z.string().min(1, 'Vui lòng nhập đường dẫn edit form!'),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function FormCreate() {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [msg, setMsg] = useState<string>('');
    const [isViewFormLink, setIsViewFormLink] = useState<boolean>(false);

    const {
        control,
        handleSubmit,
        watch,
        formState: { isSubmitting, errors },
    } = useForm<CreateFormValues>();
    
    const formLink = watch('form_link');
    
    useEffect(() => {
        if (formLink && formLink?.includes('/viewform')) {
            setIsViewFormLink(true);
        } else {
            setIsViewFormLink(false);
            setMsg('');
        }
    }, [formLink]);

    const onSubmit = async (formData: CreateFormValues) => {
        if (!formData?.form_link) {
            setMsg('Vui lòng nhập đường dẫn edit form!');
            return;
        }
        
        if (formData?.form_link.includes('/viewform')) {
            setMsg('Bạn đang sử dụng link xem form (/viewform). Vui lòng sử dụng link edit form (/edit) thay thế!');
            return;
        }

        setLoading(true);

        try {
            const res: any = await Fetch.postWithAccessToken('/api/form/create', {
                form_link: formData?.form_link,
            });

            if (res.data?.form){
                Toast.success('Tạo form thành công!');
                router.push(`/form/${res.data?.form?.id}`);
            }
        } catch (e) {
            setMsg(`Đã xảy ra lỗi, bạn hãy kiểm tra xem form đã được mở quyền truy cập cho tất có mọi người có link và tắt thu thập email, tắt cho phép chỉnh sửa câu trả lời và phải tắt mỗi mail chỉ điền 1 lần hay chưa nha ! 
                Một số câu hỏi bọn mình cũng chưa hỗ trợ ví dụ như file nè !`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="bg-gradient-to-b from-primary-50 to-white mx-auto px-4 sm:px-6">
            <div className="relative isolate overflow-hidden py-12">
                {loading && <LoadingAbsolute />}

                <div className="container mx-auto" data-aos="fade-up">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-3">Tạo Form mới</h2>
                        <p className="text-gray-600">
                            Nhập link edit form của bạn vào ô dưới đây. Hãy đọc kĩ hướng dẫn để tránh sai sót.
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                            <InlineFormItem 
                                label="Điền Edit Link Form" 
                                className="mb-6"
                                error={errors.form_link?.message}
                            >
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder="Ví dụ: https://docs.google.com/forms/d/xxx/edit"
                                            className="w-full"
                                            {...field}
                                            size="large"
                                            state={errors.form_link ? 'error' : 'normal'}
                                        />
                                    )}
                                    name="form_link"
                                    control={control}
                                />
                            </InlineFormItem>

                            <Button 
                                htmlType="submit" 
                                className="uppercase items-center mt-4 w-full block text-center py-3 px-4 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2" 
                                size="large" 
                                loading={isSubmitting || loading}
                            >
                                <span>Tạo ngay</span>
                            </Button>
                        </form>

                        {/* Alert Message */}
                        {msg && (
                            <div className="mt-4">
                                <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded text-center flex items-center gap-2 justify-center">
                                    <XCircle className="w-5 h-5 flex-shrink-0" /> 
                                    <span>{msg}</span>
                                </div>
                            </div>
                        )}
                        
                        {/* ViewForm Link Warning */}
                        {isViewFormLink && (
                            <div className="mt-4">
                                <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
                                    <h4 className="text-red-700 font-bold mb-2 flex items-center gap-2">
                                        <XCircle className="w-5 h-5" />
                                        Bạn đang sử dụng link xem form (/viewform)
                                    </h4>
                                    <p className="text-red-700 mb-4">
                                        Vui lòng sử dụng link <strong>edit form</strong> có đuôi <strong>/edit</strong> thay vì link xem form có đuôi <strong>/viewform</strong>.
                                    </p>
                                    <div className="bg-white p-3 rounded border border-red-100 mb-3">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Link xem form (không đúng):</p>
                                        <p className="text-xs bg-red-50 p-2 rounded overflow-auto text-red-700 font-mono">
                                            https://docs.google.com/forms/d/xxx/viewform
                                        </p>
                                    </div>
                                    <div className="bg-white p-3 rounded border border-green-100">
                                        <p className="text-sm font-medium text-gray-700 mb-2">Link edit form (đúng):</p>
                                        <p className="text-xs bg-green-50 p-2 rounded overflow-auto text-green-700 font-mono">
                                            https://docs.google.com/forms/d/xxx/edit
                                        </p>
                                    </div>
                                    <div className="mt-4">
                                        <Image
                                            src="/static/img/guide-s1.png"
                                            alt="Edit Link Guide"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm border border-gray-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Storylane Demo Section - After Input Form */}
                    <div className="border border-primary-100 rounded-lg overflow-hidden bg-primary-50 mb-4">
                        <h3 className="text-lg font-bold px-4 py-2 bg-primary-100 border-b border-primary-200 text-primary-800">Xem Demo Trực Quan</h3>
                        <div className="p-4">
                            <iframe
                                src="https://app.storylane.io/demo/3ad9zgkguwpw?embed=inline"
                                title="Storylane Demo"
                                width="100%"
                                height="600"
                                style={{ border: 'none', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>

                    {/* Guide Sections */}
                    <div className="space-y-12">
                        {/* Warning Note */}
                        <div className="bg-yellow-50 border border-yellow-100 rounded-lg p-4 text-yellow-800">
                            <p className="font-medium">
                                <strong className="text-yellow-600">Lưu ý quan trọng: </strong>
                                Nếu bạn <strong>thao tác lần đầu</strong>, hãy tạo bản sao cho form của mình và thực hiện trên bản sao trước nhé!
                            </p>
                        </div>

                        <div className="border border-gray-100 rounded-lg overflow-hidden">
                            <h3 className="text-xl font-bold p-4 bg-gray-50 border-b border-gray-100">Hướng Dẫn Chi Tiết</h3>
                            
                            {/* Step 1 */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Bước 1: Copy đường dẫn edit</p>
                                        <p className="mb-2 text-gray-700">
                                            Copy đường dẫn edit của form vào ô phía trên. Đường dẫn edit lấy từ trang chỉnh sửa form của bạn,
                                            <strong> phải có đuôi /edit</strong>. Ví dụ:
                                        </p>
                                        <p className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                                            https://docs.google.com/forms/d/1IkrTNv9VlSHbDbFx_tnRXXarN1BaNkzHr9VHtBamkRw/edit
                                        </p>
                                    </div>
                                    <div>
                                        <Image
                                            src="/static/img/guide-s1.png"
                                            alt="Fillform Step 1"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="p-6 border-b border-gray-100">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Bước 2: Mở quyền truy cập form và xuất bản form</p>
                                        <p className="text-gray-700">
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
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                        <Image
                                            src="/static/img/guide-s22.png"
                                            alt="Fillform Step 2.2"
                                            width={300}
                                            height={200}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="p-6">
                                <div className="grid md:grid-cols-2 gap-8 items-center">
                                    <div className="text-left">
                                        <p className="font-bold mb-2 text-gray-900">Bước 3: Cấu hình form</p>
                                        <p className="mb-4 text-gray-700">
                                            Bạn lưu ý Form <strong>phải tắt thu thập email</strong>,
                                            &nbsp;<strong>tắt cho phép chỉnh sửa câu trả lời</strong> và
                                            &nbsp;<strong>phải tắt mỗi mail chỉ điền 1 lần</strong>.
                                            Hãy cấu hình form như hình bên nhé!
                                        </p>
                                        <p className="text-gray-700">
                                            Cần hỗ trợ? Liên hệ{' '}
                                            <a
                                                href="https://www.facebook.com/survifyvn"
                                                className="text-primary-600 hover:underline font-medium"
                                            >
                                                FillForm - Điền form tự động
                                            </a>
                                        </p>
                                    </div>
                                    <div>
                                        <Image
                                            src="/static/img/guide-s3.png"
                                            alt="Fillform Step 3"
                                            width={600}
                                            height={400}
                                            className="w-full rounded-lg shadow-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}