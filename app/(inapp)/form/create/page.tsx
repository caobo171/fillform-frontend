'use client'

import { useState } from 'react'
import { XCircle } from 'lucide-react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button, Input } from '@/components/common';
import { FormItem } from '@/components/form/FormItem';
import { Container } from '@/components/layout/container/container'
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';


const formCreateSchema = z.object({
    form_link: z.string(),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function FormCreate() {
    const [errorMessage, setErrorMessage] = useState<string>();

    const {
        control,
        handleSubmit,
        formState: { isSubmitting },
    } = useForm<CreateFormValues>();

    const onSubmit: SubmitHandler<CreateFormValues> = async (formData) => {
        const { form_link } = formData;

        if (!form_link) {
            return;
        }

        try {
            const res: AnyObject = await Fetch.postWithAccessToken('/api/form/create', {
                form_link,
            });

            console.log(res);
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
                            Tạo Form mới
                        </h1>

                        <p className="mb-1 text-gray-500">
                            Nhập link edit form của bạn vào ô dưới đây
                        </p>
                        <p className="mb-1 text-gray-500">
                            Hãy đọc kĩ hướng dẫn để tránh sai sót
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


                            <Button className="w-full" size="large" loading={isSubmitting}>
                                Tạo form
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