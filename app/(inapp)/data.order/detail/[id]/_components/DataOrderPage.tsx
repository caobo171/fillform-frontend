'use client'

import LoadingAbsolute, { Loading } from '@/components/loading'
import { useMe } from '@/hooks/user'
import { Helper } from '@/services/Helper'
import { SocketService } from '@/services/SocketClient'
import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import clsx from 'clsx'
import { useDataOrderById } from '@/hooks/data.order'
import Constants, { Code, ORDER_STATUS, OPTIONS_DELAY_ENUM } from '@/core/Constants'
import { ModelAdvanceBuilder } from '@/app/(inapp)/data/builder/_components/ModelAdvanceBuilder'
import { AnyObject } from '@/store/interface'
import Fetch from '@/lib/core/fetch/Fetch'
import { Toast } from '@/services/Toast'
import SmartPLSResult from './SmartPLSResult'
import SPSSResult from './SPSSResult'



const DataOrderPage = () => {

    const params = useParams();
    const me = useMe();
    const order = useDataOrderById(params.id as string)
    const [isFetching, setIsFetching] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    useEffect(() => {
        if (order.data?.order.status === ORDER_STATUS.RUNNING) {
            setIsAnalyzing(true);
        } else {
            setIsAnalyzing(false);
        }
    }, [order.data?.order.status]);


    useEffect(() => {

        if (me) {
            (async () => {
                await Helper.waitUntil(() => {
                    return SocketService.socket;
                })


                // Create throttled version of order.mutate that executes at most once every 5 seconds
                let lastMutateTime = 0;
                const throttledMutate = () => {
                    const now = Date.now();
                    if (now - lastMutateTime >= 5000) { // 5000ms = 5s
                        lastMutateTime = now;
                        order.mutate();
                    } else {
                        console.log('Throttled order.mutate call', now - lastMutateTime, 'ms since last call');
                    }
                };

                SocketService.socket.on('order_running', (data: any) => {
                    console.log('order_running', data);
                    throttledMutate();
                });

                SocketService.socket.on('order_completed', (data: any) => {
                    console.log('order_completed', data);
                    throttledMutate();
                });

                SocketService.socket.on('ai_thinking', (data: any) => {
                    console.log('ai_thinking', data);
                    throttledMutate();
                });

                return () => {
                    SocketService.socket.off('order_running');
                    SocketService.socket.off('order_completed');
                    SocketService.socket.off('ai_thinking');
                }
            })()

        }

    }, [me]);

    // Note: You'll need to fetch this data from your API
    const isAdmin = me.data?.is_super_admin;


    useEffect(() => {

        if (me) {
            (async () => {
                await Helper.waitUntil(() => {
                    return SocketService.socket;
                })


                // Create throttled version of order.mutate that executes at most once every 5 seconds
                let lastMutateTime = 0;
                const throttledMutate = () => {
                    const now = Date.now();
                    if (now - lastMutateTime >= 5000) { // 5000ms = 5s
                        lastMutateTime = now;
                        order.mutate();
                    } else {
                        console.log('Throttled order.mutate call', now - lastMutateTime, 'ms since last call');
                    }
                };

                SocketService.socket.on('order_running', (data: any) => {
                    console.log('order_running', data);
                    throttledMutate();
                });

                SocketService.socket.on('order_completed', (data: any) => {
                    console.log('order_completed', data);
                    throttledMutate();
                });

                SocketService.socket.on('ai_thinking', (data: any) => {
                    console.log('ai_thinking', data);
                    throttledMutate();
                });

                return () => {
                    SocketService.socket.off('order_running');
                    SocketService.socket.off('order_completed');
                    SocketService.socket.off('ai_thinking');
                }
            })()

        }

    }, [me]);



    if (order.isLoading) {
        return <Loading />
    }


    return (
        <section className="bg-gradient-to-b from-primary-50 to-white py-12 mx-auto px-4 sm:px-6">
            {isFetching ? <LoadingAbsolute /> : <></>}
            <div className="container mx-auto text-center" data-aos="fade-up">
                <div className="mb-10">
                    <h2 className="text-3xl font-bold mb-4">Chi tiết Order</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left mb-8">
                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm1 11a1 1 0 11-2 0 1 1 0 012 0zm0-8a1 1 0 10-2 0v4a1 1 0 102 0V5z" clipRule="evenodd" />
                                </svg>
                                Thông tin Order
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Người tạo:</span>
                                    <span className="font-semibold">{order.data?.order.owner}</span>
                                </div>

                                <div className="flex justify-between">
                                    <span className="text-gray-600">Ngày tạo:</span>
                                    <span className="font-semibold">{new Date(order.data?.order?.createdAt || '').toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Tình trạng:</span>
                                    <span className={clsx("font-semibold px-2 py-1 rounded-full text-xs",
                                        order.data?.order.status === ORDER_STATUS.RUNNING ? "bg-blue-100 text-blue-800" : "",
                                        order.data?.order.status === ORDER_STATUS.PAUSE ? "bg-yellow-100 text-yellow-800" : "",
                                        order.data?.order.status === ORDER_STATUS.CANCELED ? "bg-red-100 text-red-800" : "",
                                        order.data?.order.status === ORDER_STATUS.SUCCESS ? "bg-green-100 text-green-800" : "",
                                        order.data?.order.status === ORDER_STATUS.ERROR ? "bg-red-100 text-red-800" : ""
                                    )}>
                                        {order.data?.order.status}
                                    </span>
                                </div>

                            </div>
                        </div>

                        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                            <h3 className="font-bold text-lg mb-4 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                Thông tin mô hình
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-start">
                                    <span className="text-gray-600">Tên Model:</span>
                                    <Link href={'/data/builder/' + order.data?.order.data_model_id} className="font-semibold text-primary-600 hover:underline text-right max-w-[60%] truncate">
                                        {order.data?.order.name}
                                    </Link>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tổng mẫu:</span>
                                    <span className="font-semibold">{order.data?.order.num}</span>
                                </div>
                            </div>
                            {
                                order.data?.order.data?.status && order.data?.order.data?.status !== 'DONE_AI_THINKING' ? (
                                    <div className="pt-2 border-t border-gray-100 mt-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">AI is thinking</span>
                                            <div className="flex items-center">
                                                {order.data?.order.status !== ORDER_STATUS.ERROR ? (
                                                    <>
                                                        {order.data?.order.createdAt && new Date().getTime() - new Date(order.data.order.createdAt).getTime() > 30 * 60 * 1000 ? (
                                                            <div className="flex items-center">
                                                                <div className="mr-2 h-4 w-4 text-red-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                                <span className="text-red-600 italic text-sm">Request may be stuck (waiting &gt;30 min)</span>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="animate-spin mr-2 h-4 w-4 text-primary-600">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                </div>
                                                                <span className="text-gray-500 italic text-sm">{order.data?.order.data?.status}</span>
                                                            </>
                                                        )}
                                                    </>
                                                ) : (

                                                    <>
                                                        <div className="flex items-center">
                                                            <div className="mr-2 h-4 w-4 text-red-600">
                                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                            <span className="text-red-600 italic text-sm">{order.data?.order.data?.error && me.data?.is_super_admin ? order.data?.order.data?.error : "AI bị lỗi, không thể phân tích cho bạn, hãy liên hệ chúng tôi để support"}</span>
                                                        </div>
                                                    </>
                                                )}

                                            </div>
                                        </div>
                                    </div>
                                ) : null
                            }

                        </div>
                    </div>
                </div>

                <div className="text-left mb-8 bg-white rounded shadow-sm p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4">Cấu hình mô hình</h2>

                    <div className="bg-white p-6 rounded-lg border border-gray-100">
                        {
                            order.data?.order?.data_model ? (
                                <ModelAdvanceBuilder model={order.data?.order?.data_model} setModel={(model) => { }} isReadOnly={true} />
                            ) : (
                                <p>Không có mô hình</p>
                            )
                        }
                    </div>
                </div>


                <div className="text-left mb-8 bg-white rounded shadow-sm p-6 border border-gray-100">
                    <h2 className="text-2xl font-bold mb-4">Kết quả dữ liệu</h2>

                    <div className="rounded-lg border border-gray-100">
                        <div
                            className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                            onClick={(e) => {
                                // Force download using Fetch API

                                let data = order.data?.order?.data?.finalData || [];

                                if (data.length === 0) {
                                    return;
                                }

                                let headers: any = {};
                                let header_keys = Object.keys(data[0]);
                                for (let i = 0; i < header_keys.length; i++) {
                                    headers[header_keys[i]] = header_keys[i];
                                }

                                let rows: AnyObject[] = [];
                                for (let row_index = 0; row_index < data.length; row_index++) {
                                    let row: AnyObject = {};
                                    for (let col_index = 0; col_index < Object.keys(headers).length; col_index++) {
                                        let header_key = Object.keys(headers)[col_index];
                                        row[header_key] = data[row_index][header_key];
                                    }
                                    rows.push(row);
                                }

                                Helper.exportCSVFile(headers, rows, Helper.purify('data_builder_' + order.data?.order?.name));
                            }}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                            </svg>
                            <span>Tải file dữ liệu CSV</span>
                        </div>
                    </div>

                    {
                        order.data?.order?.data?.report_file?.url ? (
                            <div className="rounded-lg border border-gray-100 mt-4">
                                <div
                                    className="flex cursor-pointer items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg border border-red-200 transition-colors"
                                    onClick={(e) => {
                                        // Force download using Fetch API
                                        e.preventDefault();
                                        const url = Constants.IMAGE_URL + (order.data?.order?.data?.report_file?.url || '');
                                        const filename = order.data?.order?.data?.report_file?.name || "report.pdf";

                                        fetch(url)
                                            .then(response => response.blob())
                                            .then(blob => {
                                                const blobUrl = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.style.display = 'none';
                                                a.href = blobUrl;
                                                a.download = filename;
                                                document.body.appendChild(a);
                                                a.click();
                                                window.URL.revokeObjectURL(blobUrl);
                                                document.body.removeChild(a);
                                            })
                                            .catch(() => window.open(url, '_blank'));
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <span>Tải file báo cáo</span>
                                </div>
                            </div>
                        ) : null
                    }
                </div>




                <>
                    {
                        isAdmin ? (
                            <>
                                {
                                    order.data?.order?.data?.smartPLS ? (
                                        <SmartPLSResult
                                            data={order.data.order.data.smartPLS}
                                            title="Kết quả phân tích SmartPLS"
                                            className="mb-8"
                                        />
                                    ) : null
                                }

                                {/* SPSS Analysis Results */}
                                {
                                    (order.data?.order?.data?.basic_analysis || order?.data?.order?.data?.linear_regression_analysis) ? (
                                        <SPSSResult
                                            basicAnalysis={order.data?.order?.data?.basic_analysis}
                                            linearRegressionAnalysis={order?.data?.order?.data?.linear_regression_analysis}
                                            title="Kết quả phân tích SPSS"
                                            className="mb-8"
                                        />
                                    ) : null
                                }
                            </>
                        ) : null
                    }

                </>




                {/* SmartPLS Analysis Section */}
                {
                    isAdmin ? (
                        <div className="text-left mb-8 bg-white rounded shadow-sm p-6 border border-gray-100">
                            <h2 className="text-2xl font-bold mb-4">Chạy phân tích dữ liệu SmartPLS</h2>
                            <p className="text-gray-600 mb-6">Chưa có kết quả phân tích. Nhấn nút bên dưới để bắt đầu phân tích dữ liệu với thuật toán SmartPLS.</p>

                            <button
                                onClick={async () => {
                                    setIsAnalyzing(true);
                                    try {
                                        const response = await Fetch.postWithAccessToken<{
                                            order: any,
                                            code: number,
                                            message: string
                                        }>("/api/data.order/analysize", {
                                            id: params.id
                                        });

                                        if (response.data.code === Code.SUCCESS) {
                                            Toast.success("Phân tích thành công!");
                                            order.mutate();
                                        } else {
                                            Toast.error(response.data.message || "Có lỗi xảy ra khi phân tích");
                                        }
                                    } catch (error) {
                                        console.error("Analysis error:", error);
                                        Toast.error("Có lỗi xảy ra khi phân tích");
                                    } finally {
                                        setIsAnalyzing(false);
                                    }
                                }}
                                disabled={isAnalyzing}
                                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors duration-200 space-x-2"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Đang phân tích...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                                        </svg>
                                        <span>Bắt đầu phân tích SmartPLS</span>
                                    </>
                                )}
                            </button>
                        </div>
                    ) : null
                }
            </div>
        </section>
    )
}

export default DataOrderPage