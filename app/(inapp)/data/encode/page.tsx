'use client'

import { Fragment, useState } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
    ArrowDownCircleIcon,
    ArrowPathIcon,
    ArrowUpCircleIcon,
    CursorArrowRippleIcon,
} from '@heroicons/react/20/solid'
import { MeHook } from '@/store/me/hooks'
import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { mutate } from 'swr';
import { z } from 'zod';

import { Button, Checkbox, Input } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import Meta from '@/components/ui/Meta';
import { Code } from '@/core/Constants';
import Cookie from '@/lib/core/fetch/Cookie';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';
import { Container } from '@/components/layout/container/container'


const formCreateSchema = z.object({
    form_link: z.string(),
    sheet_data_link: z.string(),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function FormCreate() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const user = MeHook.useMe();


    const [errorMessage, setErrorMessage] = useState<string>();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<CreateFormValues>();

    const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
        const { form_link, sheet_data_link } = formData;

        if (!form_link) {
            return;
        }

        try {
            await Fetch.downloadWithAccessToken('/api/form/data.encode', {
                form_link,
                sheet_data_link,
            });

        } catch (e) {
            setErrorMessage('Something went wrong!');
        }
    };

    return (
        <>
            <Container>
                <div className="relative isolate overflow-hidden pt-0">

                    <div className="text-center text-sm leading-5 mb-[60px] w-full sm:w-auto">

                        <h1 className="mt-12 text-3xl font-bold text-center leading-8 text-gray-900 mb-2">
                            Mã hóa data từ kết quả có sẵn
                        </h1>

                        <p className="mb-1 text-gray-500">
                            Hãy nhập link /edit vủa Google Form và Google Sheet tương ứng của form vào ô dưới dây
                        </p>
                        <p className="mb-1 text-gray-500">
                            Hãy nhớ mở quyền truy cập all cho cả sheet và form bạn nhé
                        </p>

                        <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="w-full mb-6 mt-6"
                        >
                            <FormItem label="Điền Edit Link Form" className="mb-6">
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder='Điền form edit vào đây'
                                            className="w-full"
                                            type="text"
                                            {...field}
                                            size="large"
                                        />
                                    )}
                                    name="form_link"
                                    control={control}
                                />
                            </FormItem>
                            <FormItem label="Điền Link sheet data" className="mb-6">
                                <Controller
                                    render={({ field }) => (
                                        <Input
                                            placeholder='Điền Link sheet data vào đây'
                                            className="w-full"
                                            type="text"
                                            {...field}
                                            size="large"
                                        />
                                    )}
                                    name="sheet_data_link"
                                    control={control}
                                />
                            </FormItem>


                            <Button className="w-full" size="large" loading={isSubmitting}>
                                Mã hoá dữ liệu ngay
                            </Button>
                        </form>

                        {errorMessage && (
                            <p className="text-red-500 flex items-center gap-2">
                                <XCircle className="w-5 h-5" /> {errorMessage}
                            </p>
                        )}
                    </div>
                </div>
            </Container>
        </>
    )
}