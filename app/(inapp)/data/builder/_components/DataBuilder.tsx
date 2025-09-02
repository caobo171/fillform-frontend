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
import { RawDataModel } from '@/store/types';
import { Code } from '@/core/Constants'
import DataModelLists from '../_sections/DataModelLists'
import DataOrderLists from '../_sections/DataOrderLists'
import { AdvanceModelType } from '@/store/data.service.types'

export default function DataBuilder() {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [name, setName] = useState<string>('');

    const [model, setModel] = useState<AdvanceModelType | null>(null);

    const onSubmitHandle = async () => {
        if (!model) return;
        setLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{
                code: number,
                data_model: RawDataModel,
                message: string,
            }>('/api/data.model/create', {
                model: JSON.stringify(model),
                name: name,
            });

            if (res.data.code == Code.SUCCESS) {
                Toast.success('Generate data successfully');
            } else {
                return Toast.error(res.data.message || 'Generate data failed');
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <section className="bg-gradient-to-b from-primary-50 to-white mx-auto px-4 sm:px-6">
                <div className="relative isolate overflow-hidden py-12">
                    {loading && <LoadingAbsolute />}

                    <div className="container mx-auto space-y-8" data-aos="fade-up">
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
                                <ModelAdvanceBuilder model={model} setModel={setModel} useLocalStorage={true} />

                                {/* Sample Size Input */}
                                <FormItem label="Tên của model">
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập Tên model để lưu"
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
                                        Tạo model mới
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



                        {/* Forms Table */}
                        <DataModelLists />


                        {/* Orders Table */}
                        <DataOrderLists />
                    </div>
                </div>
            </section>
        </>

    )
}