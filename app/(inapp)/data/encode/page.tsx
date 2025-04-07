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
import ExcelJS from 'exceljs';
import { Container } from '@/components/layout/container/container'
import { Helper } from '@/services/Helper'
import { CSVLink } from 'react-csv'


const formCreateSchema = z.object({
    form_link: z.string(),
    sheet_data_link: z.string(),
});

type CreateFormValues = z.infer<typeof formCreateSchema>;

export default function FormCreate() {

    const [errorMessage, setErrorMessage] = useState<string>();
    const [sheetData, setSheetData] = useState<{
        data: any,
        headers: any,
        name: string,
    }>({
        data: [],
        headers: [],
        name: '',
    });
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
            const res = await Fetch.postWithAccessToken<{
                data: any,
                form: any,
                sheet: any,
                name: string,
            }>('/api/form/data.encode', {
                form_link,
                sheet_data_link,
            });

            console.log(res);

            const data = res.data.data;
            const form = res.data.form;
            const sheet = res.data.sheet;
            console.log(data, form, sheet);

            let headers: AnyObject = {};
            for (let i = 0; i < data[0].length; i++) {
               headers[data[0][i]] = data[0][i];
            }

            let rows: AnyObject[] = [];
            for (let row_index = 1; row_index < data.length; row_index++) {
                let row: AnyObject = {};
                for (let col_index = 0; col_index < data[0].length; col_index++) {
                    row[data[0][col_index]] = data[row_index][col_index];
                }
                rows.push(row);
            }

            Helper.exportCSVFile(headers, rows, Helper.purify(res.data.name));


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

                            <CSVLink data={sheetData.data} headers={sheetData.headers} filename={`${Helper.purify(sheetData.name)}_result.csv`}></CSVLink>
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