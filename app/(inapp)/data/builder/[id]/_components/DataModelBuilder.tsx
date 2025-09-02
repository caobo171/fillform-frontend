'use client'

import { useEffect, useState } from 'react'
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
import { RawDataModel } from '@/store/types';
import { Code } from '@/core/Constants'
import { ModelAdvanceBuilder } from '../../_components/ModelAdvanceBuilder'
import { useDataModelById } from '@/hooks/data.model'
import { useParams, useRouter } from 'next/navigation';
import { AdvanceModelType } from '@/store/data.service.types'
import CreateDownloadOrderForm from '@/components/form/CreateDownloadOrderForm'
import { useMe, useMyBankInfo } from '@/hooks/user'

export default function DataModelBuilder() {


    const params = useParams();
    const router = useRouter();
    const { data: dataModel, isLoading: isLoadingModel, mutate: mutateModel } = useDataModelById(params.id as string);
    const me = useMe();
    const bankInfo = useMyBankInfo();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>();
    const [name, setName] = useState<string>('');
    const [sample, setSample] = useState<number>(0);

    const [model, setModel] = useState<AdvanceModelType | null>(null);
    // State for showing download order form after model is saved
    const [showDownloadForm, setShowDownloadForm] = useState<boolean>(false);
    const [numRequest, setNumRequest] = useState<number>(0);
    const [submitDisabled, setSubmitDisabled] = useState<boolean>(false);
    useEffect(() => {
        if (dataModel?.data_model?.data_model) {
            setModel(dataModel.data_model?.data_model as AdvanceModelType);
            setName(dataModel.data_model?.name || '');
        }
    }, [dataModel]);

    const onSubmitHandle = async () => {
        if (!model) return;
        setLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{
                code: number,
                data_model: RawDataModel & { _id: string },
                message: string,
            }>('/api/data.model/save.model', {
                id: dataModel?.data_model?.id,
                model: JSON.stringify(model),
                name: name,
            });

            if (res.data.code == Code.SUCCESS) {
                Toast.success('Model saved successfully! Now you can create a download order.');
                // Show the download order form after successful model save
                setShowDownloadForm(true);
            } else {
                return Toast.error(res.data.message || 'Generate data failed');
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDownloadOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!numRequest || numRequest <= 0) {
            Toast.error('Please enter a valid number of requests');
            return;
        }

        setLoading(true);
        setSubmitDisabled(true);

        try {
            const response = await Fetch.postWithAccessToken<{
                code: number,
                message?: string,
                result: {
                    finalData: any[]
                }
            }>('/api/data.order/create.run', {
                model_id: dataModel?.data_model?.id,
                num_request: numRequest,
            });


            let data = response.data.result.finalData;

            let headers: AnyObject = {};
            let header_keys = Object.keys(data[0]);
            for (let i = 0; i < header_keys.length; i++) {
                headers[header_keys[i]] = header_keys[i];
            }

            let rows: AnyObject[] = [];
            for (let row_index = 1; row_index < data.length; row_index++) {
                let row: AnyObject = {};
                for (let col_index = 0; col_index < Object.keys(headers).length; col_index++) {
                    let header_key = Object.keys(headers)[col_index];
                    row[header_key] = data[row_index][header_key];
                }
                rows.push(row);
            }

            Helper.exportCSVFile(headers, rows, Helper.purify('data_builder_' + name));

            if (response.data.code === Code.SUCCESS) {
                Toast.success('Download order created successfully!');
                router.push('/data/builder');
            } else {
                Toast.error(response.data.message || 'Failed to create download order');
            }
        } catch (error) {
            console.error('Error creating download order:', error);
            Toast.error('Failed to create download order');
        } finally {
            setLoading(false);
            setSubmitDisabled(false);
        }
    }

    return (
        <>
            <section className="bg-gradient-to-b from-primary-50 to-white">
                <div className="container mx-auto px-4 pt-8 pb-6" data-aos="fade-up">
                    {(loading) && <LoadingAbsolute />}
                    <div className="container mx-auto mb-8">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-3 text-center text-gray-900">Build dữ liệu đẹp</h1>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                            <div className="space-y-4 text-xs text-gray-700">
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Bạn điền <b>tỉ lệ mong muốn (đơn vị %) là số tự nhiên</b>, tương ứng với mỗi đáp án của câu hỏi</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p><b>Hãy chỉnh sửa tỉ lệ để phù hợp nhất với đề tài của bạn.</b> FillForm sẽ chỉ cam kết điền form đúng theo yêu cầu tỉ lệ</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                    <p>Video hướng dẫn chi tiết: <a href="https://www.youtube.com/watch?v=3_r-atbIiAI" className="text-primary-600 font-medium hover:underline">Xem tại đây</a></p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p>Tên mô hình <b>{dataModel?.data_model.name}</b></p>
                                </div>
                            </div>
                        </div>


                        {/* Form Section */}
                        <div className="bg-white shadow-sm rounded-lg border border-gray-100 mb-6">
                            <div
                                className="p-6 flex flex-col gap-6"
                            >


                                {
                                    model ? (
                                        <ModelAdvanceBuilder
                                            model={model}
                                            setModel={setModel}
                                            useLocalStorage={false}
                                        />
                                    ) : (
                                        <></>
                                    )
                                }

                                {/* Sample Size Input */}
                                <FormItem label="Tên của model">
                                    <Input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Nhập Tên model để lưu"
                                    />
                                </FormItem>

                                {!showDownloadForm ? (
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
                                            Lưu mô hình
                                        </div>
                                    </Button>
                                ) : (
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                                        <div className="flex items-center gap-2 mb-4">
                                            <svg className="flex-shrink-0 h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                            <h3 className="text-xl font-bold text-gray-900">TẠO YÊU CẦU TẢI DỮ LIỆU</h3>
                                        </div>

                                        <form onSubmit={handleDownloadOrderSubmit}>
                                            <CreateDownloadOrderForm
                                                userCredit={me.data?.credit || 0}
                                                numRequest={numRequest}
                                                modelId={dataModel?.data_model?.id || undefined}
                                                modelName={name}
                                                bankInfo={bankInfo}
                                                onNumRequestChange={(value) => setNumRequest(value)}
                                                className="max-w-full"
                                                showTitle={false}
                                                showBackButton={false}
                                            />

                                            <button
                                                type="submit"
                                                disabled={submitDisabled || loading || numRequest <= 0}
                                                className={`w-full mt-6 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all flex items-center justify-center
                                                ${submitDisabled || numRequest <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                {loading ? 'Đang xử lý...' : 'Tạo yêu cầu tải dữ liệu'}
                                            </button>
                                        </form>
                                    </div>
                                )}


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
        </>

    )
}