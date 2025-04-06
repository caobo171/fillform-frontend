'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { useFormById } from '@/hooks/form';
import { useParams } from 'next/navigation';
import Fetch from '@/lib/core/fetch/Fetch';
import LoadingAbsolute from '@/components/loading';
import { RawForm } from '@/store/types';

interface ChatError {
    id: string;
    message: string;
    type: 'error' | 'warning' | 'note';
}


export default function FormRate() {

    const params = useParams();
    const { data: dataForm, isLoading: isLoadingForm, mutate: mutateForm } = useFormById(params.id as string);
    const { register, handleSubmit, watch, setValue } = useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [reloadEvent, setReloadEvent] = useState(false);

    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [chatOpen, setChatOpen] = useState<boolean>(true);
    const [chatErrors, setChatErrors] = useState<ChatError[]>([]);

    const onSubmit = async (data: any) => {
        // Handle form submission

        try {
            await Fetch.postWithAccessToken('/api/form/save', {
                id: dataForm?.form.id,
                ...data,
            });
        } catch (error) {
            console.error(error);
        }

        setIsSaved(true);
    };


    const autoFillHandle = async (): Promise<void> => {
        setIsLoading(true);
        try {
            const res = await Fetch.postWithAccessToken<{ code: number, message: string, form: RawForm }>('/api/form/rate.autofill', {
                id: dataForm?.form.id,
            });

            await mutateForm();

            // After mutating, update all form values
            if (res.data.form.loaddata) {
                res.data.form.loaddata.forEach((question) => {
                    if (question.type) {
                        setValue(`isMulti-${question.id}`, question.isMulti);
                        setValue(`totalans-${question.id}`, question.totalAnswer);
                        setValue(`type-${question.id}`, question.type);

                        question.answer?.forEach((answer: any) => {
                            if (answer.data) {
                                setValue(`answer_${answer.id}`, answer.count);
                            }
                        });
                    } else {
                        question.answer?.forEach((answer: any) => {
                            setValue(answer.id, answer.count);
                            if (answer.data) {
                                setValue(`custom-${answer.id}`, answer.data);
                            }
                        });
                    }
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
            setReloadEvent(!reloadEvent);
        }
    };

    const toggleChat = (): void => {
        setChatOpen(!chatOpen);
    };

    const removeChatError = (errorId: string): void => {
        setChatErrors(chatErrors.filter(error => error.id !== errorId));
    };

    const addChatError = (message: string, errorId: string, type: 'error' | 'warning' | 'note'): void => {
        // Check if error already exists
        if (chatErrors.some(error => error.id === errorId)) return;
        setChatErrors([...chatErrors, { id: errorId, message, type }]);
    };


    const validateInputs = (): void => {
        // Validation logic here
        // Similar to the original but using React state

        // Example validation:
        document.querySelectorAll("input[type='number']").forEach((input: Element) => {
            if (input instanceof HTMLInputElement) {
                const value = parseInt(input.value, 10);
                const errorId = `error-${input.id}`;

                if (value < 0 || value > 100) {
                    addChatError(`Giá trị không hợp lệ (${value}). Hãy điền tỉ lệ (%) là số tự nhiên từ 0-100`, errorId, "error");
                }
            }
        });

        // Add other validations as needed
        // Multi-choice validation
        document.querySelectorAll("[id^='isMulti-']").forEach((multiInput: Element) => {
            if (multiInput instanceof HTMLInputElement) {
                const questionId = multiInput.id.split('-')[1];
                const totalInput = document.getElementById(`totalans-${questionId}`);
                let sum = 0;

                if (multiInput.value === "1") { // Multi-choice question
                    document.querySelectorAll(`input[id^='answer_${questionId}']`).forEach((input: Element) => {
                        if (input instanceof HTMLInputElement) {
                            sum += parseInt(input.value, 10) || 0;
                        }
                    });

                    if (sum < 120) {
                        addChatError(`Câu chọn nhiều đáp án. Cần điền tỉ lệ (%) là số tự nhiên từ 0-100. Và tổng tỉ lệ nên lớn hơn 120, để trộn tốt nhất (hiện tại: ${sum})`, `multi-error-${questionId}`, "error");
                    }
                }
            }
        });

        // "Other" option validation
        document.querySelectorAll(".js-answer-select").forEach((select: Element) => {
            if (select instanceof HTMLSelectElement) {
                if (select.value.toLowerCase().includes("other")) {
                    addChatError(`Bạn chọn "other - bỏ qua không điền". Hãy kiểm tra lại đã tắt bắt buộc điền trên Google Form chưa?`, `select-error-${select.id}`, "warning");
                }
            }
        });
    };

    const validateConfig = (): void => {
        // Config validation logic
        if (dataForm?.config?.lang === null) {
            addChatError(`Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt thu thập email và tắt giới hạn trả lời nhé`, `00000`, "warning");
        } else {
            if (dataForm?.config?.isValidPublished === "false") {
                addChatError(`<b>Google Form!</b> Form chưa Xuất bản/Publish. Nếu là Form cũ (trước 2025) có thể bỏ qua lỗi này.`, `00004`, "error");
            } else if (dataForm?.config?.isValidPublished === "null") {
                addChatError(`<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ Xuất bản/Publish Form nhé!`, `00004`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "false") {
                addChatError(`<b>Google Form!</b> Phải chọn "Không thu thập email/ Do not Collect" trong setting.`, `00001`, "error");
            } else if (dataForm?.config?.isValidCollectEmail === "null") {
                addChatError(`Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt thu thập email. Phải chọn "Không thu thập email/ Do not Collect" trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidEditAnswer === "false") {
                addChatError(`<b>Google Form!</b> Phải tắt cho phép chỉnh sửa câu trả lời trong setting.`, `00002`, "error");
            } else if (dataForm?.config?.isValidEditAnswer === "null") {
                addChatError(`<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt "cho phép chỉnh sửa câu trả lời" trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidLimitRes === "false") {
                addChatError(`<b>Google Form!</b> Phải tắt mọi giới hạn trả lời trong setting.`, `00003`, "error");
            } else if (dataForm?.config?.isValidLimitRes === "null") {
                addChatError(`<b>Google Form!</b> Hiện tại hệ thống không thể kiểm tra config, hãy nhớ tắt mọi giới hạn trả lời trong setting nhé!`, `00001`, "warning");
            }

            if (dataForm?.config?.isValidCollectEmail === "true" &&
                dataForm?.config?.isValidEditAnswer === "true" &&
                dataForm?.config?.isValidLimitRes === "true" &&
                dataForm?.config?.isValidPublished === "true") {
                addChatError(`Tuyệt! Google form này setting OK. Hãy config tỉ lệ nhé.`, `00005`, "note");
            }
        }
    };

    // Function to handle select change
    const handleSelectChange = (selectId: string) => {
        const select = document.getElementById(selectId) as HTMLSelectElement;
        if (select) {
            const inputId = selectId.replace("select-", "custom-");
            const textarea = document.getElementById(inputId) as HTMLTextAreaElement;
            if (textarea) {
                textarea.style.display = select.value === "custom (nội dung tùy chỉnh)" ? "block" : "none";
            }
        }
    };

    useEffect(() => {
        if (dataForm?.form && dataForm?.form.loaddata) {
            validateConfig();
            validateInputs();

            // Add event listeners for form validation
            const numberInputs = document.querySelectorAll("input[type='number']");
            const selects = document.querySelectorAll(".js-answer-select");

            const handleInputChange = () => validateInputs();

            numberInputs.forEach(input => {
                input.addEventListener('input', handleInputChange);
            });

            // Initialize textarea visibility
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                handleSelectChange(selectElement.id);
            });

            // Add event listeners for select changes
            selects.forEach((select: Element) => {
                const selectElement = select as HTMLSelectElement;
                selectElement.addEventListener('change', () => handleSelectChange(selectElement.id));
            });

            // Cleanup event listeners
            return () => {
                numberInputs.forEach(input => {
                    input.removeEventListener('input', handleInputChange);
                });

                selects.forEach((select: Element) => {
                    const selectElement = select as HTMLSelectElement;
                    selectElement.removeEventListener('change', () => handleSelectChange(selectElement.id));
                });
            };
        }
    }, [dataForm, reloadEvent]);


    if (isLoadingForm || !dataForm || isLoading) {
        return (
            <LoadingAbsolute />
        );
    }



    return (
        <>
            <section className="py-12 bg-white">
                <div className="container mx-auto text-center" data-aos="fade-up">

                    {
                        isSaved && (
                            <div className="bg-primary-100 border-primary-500 border-primary-1 text-blue-700 p-4 mb-4 rounded-md" role="alert">
                                <div className='mb-4'>
                                    Đã lưu dữ liệu thành công
                                </div>
                                <Link href={`/form/run/${dataForm?.form.id}`} className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                                    Tạo yêu cầu điền đơn ngay!
                                </Link>
                            </div>
                        )
                    }

                    <div className="mb-10">
                        <h2 className="text-3xl font-bold mb-4">Điền theo tỉ lệ mong muốn</h2>
                        <div className="mb-4">
                            <Link href="" className="inline-block px-4 py-2 bg-primary-600 text-white rounded mr-2 mb-2 hover:bg-primary-700">
                                Điền theo tỉ lệ mong muốn
                            </Link>
                            <Link href={`/form/prefill/${dataForm?.form.id}`} className="inline-block px-4 py-2 border border-primary-600 text-blue-600 rounded mr-2 mb-2 hover:bg-primary-50">
                                Điền theo data có trước
                            </Link>
                        </div>
                        <p className="mb-2">Bạn điền <b>tỉ lệ mong muốn (đơn vị %) là số tự nhiên</b>, tương ứng với mỗi đáp án của câu hỏi nhé</p>
                        <p className="mb-2">
                            Nếu bạn chưa biết điền. Hãy thử <span onClick={autoFillHandle} className="text-blue-600 text-lg font-bold cursor-pointer">ấn vào đây</span> để fillform <b>đề xuất tỉ lệ</b> cho bạn tham khảo nha!(Tỉ lệ mang tính chất tham khảo để bạn duyệt trước).
                        </p>
                        <p className="mb-2"><b>Hãy chỉnh sửa tỉ lệ để phù hợp nhất với đề tài của bạn</b> FillForm sẽ chỉ cam kết điền form đúng theo yêu cầu tỉ lệ</p>
                        <p>Video hướng dẫn chi tiết: <a href="https://www.youtube.com/watch?v=3_r-atbIiAI" className="text-blue-600">https://www.youtube.com/watch?v=3_r-atbIiAI</a></p>
                    </div>

                    <form className="mb-6">
                        <div className="mb-4">
                            <div className="flex mb-3 w-full">
                                <span className="inline-flex items-center px-3 py-2 text-gray-900 bg-gray-200 border rounded-l-md w-3/12">Link Form</span>
                                <input type="text" className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    id="urlMain" name="urlMain" defaultValue={dataForm?.form.urlMain} />
                            </div>
                            <div className="flex mb-3 w-full">
                                <span className="inline-flex items-center px-3 py-2 text-gray-900 bg-gray-200 border rounded-l-md w-3/12">Tên Form</span>
                                <input type="text" className="rounded-r-md border-gray-300 flex-1 appearance-none border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
                                    id="urlCopy" name="urlCopy" defaultValue={dataForm?.form.name} />
                            </div>
                            <input type="hidden" id="lang" name="lang" value={dataForm?.config?.lang || ''} />
                            <input type="hidden" id="isValidCollectEmail" name="isValidCollectEmail" value={dataForm?.config?.isValidCollectEmail || ''} />
                            <input type="hidden" id="isValidEditAnswer" name="isValidEditAnswer" value={dataForm?.config?.isValidEditAnswer || ''} />
                            <input type="hidden" id="isValidLimitRes" name="isValidLimitRes" value={dataForm?.config?.isValidLimitRes || ''} />
                            <input type="hidden" id="isValidPublished" name="isValidPublished" value={dataForm?.config?.isValidPublished || ''} />
                        </div>
                    </form>

                    <form onSubmit={handleSubmit(onSubmit)} className="text-left bg-gray-50 p-6 rounded-lg">
                        <div className="space-y-2">
                            {dataForm?.form.loaddata && dataForm?.form.loaddata.map((question, questionId) => (
                                <div key={questionId} className="p-4 bg-white rounded shadow-sm text-xs">
                                    <div className="md:flex md:items-start gap-8">
                                        <div className="md:w-1/4 mb-4 md:mb-0">
                                            {question.description ? (
                                                <>
                                                    <label className="block font-bold mb-1 truncate w-full">{question.question}</label>
                                                    <label className="block truncate w-full text-gray-400">{question.description}</label>
                                                </>
                                            ) : (
                                                <label className="block font-bold truncate w-full">{question.question}</label>
                                            )}
                                        </div>

                                        <div className="md:w-3/4">

                                            {question.type ? (
                                                <>
                                                    <div className="grid grid-cols-5 gap-4">
                                                        <input type="hidden" {...register(`isMulti-${question.id}`)} defaultValue={question.isMulti} />
                                                        <input type="hidden" {...register(`totalans-${question.id}`)} defaultValue={question.totalAnswer} />
                                                        <input type="hidden" {...register(`type-${question.id}`)} defaultValue={question.type} />

                                                        {question.answer && question.answer.map((answer: any, answerId: any) => (
                                                            answer.data && (
                                                                <div key={answerId} className="relative">
                                                                    <label
                                                                        htmlFor="name"
                                                                        className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                                    >
                                                                        {answer.data}
                                                                    </label>
                                                                    <input
                                                                        type="number"
                                                                        min="0"
                                                                        step="1"
                                                                        {...register('answer_' + answer.id)}
                                                                        defaultValue={answer.count}
                                                                        className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                                    />
                                                                </div>

                                                            )
                                                        ))}
                                                    </div>
                                                </>
                                            ) : (
                                                question.answer && question.answer.map((answer: any, answerId: any) => (
                                                    <div key={answerId} className="relative w-full">
                                                        <label
                                                            htmlFor="name"
                                                            className="absolute -top-2 left-2 inline-block rounded-lg bg-white px-1 text-xs font-medium text-gray-900 max-w-full truncate"
                                                        >
                                                            Chọn loại câu hỏi tự luận (Nếu chọn "other-Bỏ qua không điền" thì bạn phải "tắt bắt buộc điền trên Google Form")
                                                        </label>
                                                        <select
                                                            className="js-answer-select block w-full rounded-md bg-white px-3 py-4 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
                                                            id={`select-${answer.id}`}
                                                            {...register('answer_' + answer.id)}
                                                            defaultValue={answer.count}
                                                        >
                                                            {answer.options && answer.options.map((option: any, optionId: any) => (
                                                                <option key={optionId} value={option}>{option}</option>
                                                            ))}
                                                        </select>

                                                        <textarea
                                                            className="mt-2 w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm hidden custom-input"
                                                            id={`custom-${answer.id}`}
                                                            {...register(`custom-${answer.id}`)}
                                                            defaultValue={answer.data}
                                                            placeholder="Nhập mỗi dòng 1 câu trả lời (ấn enter để xuống dòng). Không để dòng trống. Tool sẽ điền lặp lại ngẫu nhiên nếu số lượng không đủ."
                                                        />
                                                    </div>


                                                ))
                                            )}

                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="submit"
                                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                            >
                                Lưu lại và tiếp tục
                            </button>

                            {
                                isSaved && (
                                    <div className="bg-primary-100 border-primary-500 border-primary-1 text-blue-700 p-4 mb-4 text-center" role="alert">
                                        <div className='mb-4'>
                                            Đã lưu dữ liệu thành công
                                        </div>
                                        <Link href={`/form/run/${dataForm?.form.id}`} className="inline-block px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700">
                                            Tạo yêu cầu điền đơn ngay!
                                        </Link>
                                    </div>
                                )
                            }
                        </div>
                    </form>
                </div >
            </section >

            {/* Chat Container - moved outside section */}
            < div className={`fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-[9999] ${chatOpen ? 'h-96' : 'h-12'}`
            }>
                <div
                    className="bg-primary-600 text-white p-3 flex items-center justify-between cursor-pointer"
                    onClick={toggleChat}
                >
                    <div className="flex items-center">
                        <Image src="/static/img/logo-white-short.png" alt="Logo" width={24} height={24} className="mr-2" />
                        <span className="font-medium">Bé Fill Điền Form</span>
                    </div>
                    <div className="flex items-center">
                        <div className="relative mr-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                            </svg>
                            {chatErrors.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                                    {chatErrors.length}
                                </span>
                            )}
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform ${chatOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                {
                    chatOpen && (
                        <div className="p-3 h-full overflow-y-auto">
                            <div className="text-sm">
                                <p>💡 Chào bạn! Bé Fill ở đây để giúp bạn check những rủi ro Config nha.</p>

                                {chatErrors.map((error) => (
                                    <div key={error.id} className="mt-2">
                                        <div className={`p-2 rounded text-sm relative ${error.type === "error" ? "bg-red-100 text-red-800" :
                                            error.type === "warning" ? "bg-yellow-100 text-yellow-800" :
                                                "bg-primary-100 text-blue-800"
                                            }`}>
                                            <button
                                                className="absolute top-1 right-1 text-xs"
                                                onClick={() => removeChatError(error.id)}
                                            >
                                                ✖
                                            </button>
                                            <strong>
                                                {error.type === "error" ? "Lỗi! " :
                                                    error.type === "warning" ? "Cẩn thận! " : ""}
                                            </strong>
                                            <span dangerouslySetInnerHTML={{ __html: error.message }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }
            </div >
        </>
    );
}