'use client'

import { useState } from 'react'
import { Controller, SubmitHandler, useForm } from 'react-hook-form'
import { XCircle } from 'lucide-react'
import { z } from 'zod'

import { Button, Input } from '@/components/common'
import { FormItem, InlineFormItem } from '@/components/form/FormItem'
import Fetch from '@/lib/core/fetch/Fetch'
import { Helper } from '@/services/Helper'
import { CSVLink } from 'react-csv'
import LoadingAbsolute from '@/components/loading'
import { Toast } from '@/services/Toast'
import { AnyObject } from '@/store/interface'
import { ModelAdvanceBuilder } from './ModelAdvanceBuilder'
import { DagModeType } from '@/store/types';
import { Code } from '@/core/Constants'

export default function DataBuilder() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [sampleSize, setSampleSize] = useState<number>(100);

    const [model, setModel] = useState<DagModeType | null>(null);

    const onSubmitHandle = async () => {
        if (!model) return;
        setLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{
                code: number,
                result: {
                    finalData: any[]
                }
            }>('/api/data.service/advance.generate', {
                model: JSON.stringify(model),
                sample_size: sampleSize,
            });

            if (res.data.code == Code.SUCCESS) {
                Toast.success('Generate data successfully');
            } else {
                return Toast.error('Generate data failed');
            }

            console.log(res.data);

            let data = res.data.result.finalData;

            let headers: AnyObject = {};
            let header_keys = Object.keys(data[0]);
            for (let i = 0; i < header_keys.length; i++) {
                headers[header_keys[i]] = header_keys[i];
            }

            console.log(data)


            let rows: AnyObject[] = [];
            for (let row_index = 1; row_index < data.length; row_index++) {
                let row: AnyObject = {};
                for (let col_index = 0; col_index < Object.keys(headers).length; col_index++) {
                    let header_key = Object.keys(headers)[col_index];
                    row[header_key] = data[row_index][header_key];
                }
                rows.push(row);
            }

            Helper.exportCSVFile(headers, rows, Helper.purify('data_builder'));


        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="bg-gradient-to-b from-primary-50 to-white mx-auto px-4 sm:px-6">
            <div className="relative isolate overflow-hidden py-12">
                {loading && <LoadingAbsolute />}

                <div className="container mx-auto" data-aos="fade-up">
                    {/* Header */}
                    <div className="mb-8 text-center">
                        <h2 className="text-3xl font-bold mb-3">Build dữ liệu đẹp</h2>
                        <p className="text-gray-600">
                            Build dữ liệu đẹp chuẩn SPSS, SmartPLS, có tính chất nghiên cứu khoá học cao
                        </p>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                        <div
                            className="p-6 flex flex-col gap-6"
                        >
                            <ModelAdvanceBuilder model={model} setModel={setModel} />

                            {/* Sample Size Input */}
                            <FormItem label="Số lượng mẫu dữ liệu">
                                <Input
                                    type="number"
                                    value={sampleSize}
                                    onChange={(e) => setSampleSize(Number(e.target.value))}
                                    placeholder="Nhập số lượng mẫu dữ liệu cần tạo"
                                />
                            </FormItem>

                            <Button
                                onClick={onSubmitHandle}
                                className="w-full font-bold"
                                size="large"
                                loading={loading}
                            >
                                <div className="flex items-center justify-center">
                                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Download dữ liệu
                                </div>
                            </Button>


                            {/* Alert Message */}
                            {errorMessage && (
                                <div className="px-6">
                                    <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded text-center flex items-center gap-2 justify-center">
                                        <XCircle className="w-5 h-5 flex-shrink-0" />
                                        <span>{errorMessage}</span>
                                    </div>
                                </div>
                            )}
                        </div>


                    </div>
                </div>
            </div>
        </section>
    )
}