import React, { useEffect, useState } from 'react';
import { OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from '@/core/Constants';
import PaymentInformation from '../common/PaymentInformation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useMe } from '@/hooks/user';

interface CreateDownloadOrderFormProps {
    userCredit: number;
    numRequest: number;
    formId?: string;
    formName?: string;
    bankInfo?: any;
    onNumRequestChange: (value: number) => void;
    className?: string;
    showTitle?: boolean;
    showBackButton?: boolean;
}


const CreateDownloadOrderForm: React.FC<CreateDownloadOrderFormProps> = ({
    userCredit,
    numRequest,
    formId,
    formName,
    bankInfo,
    onNumRequestChange,
    className = '',
    showTitle = true,
    showBackButton = true,
}) => {
    const user = useMe();
    const [pricePerUnit, setPricePerUnit] = useState<number>(OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price);
    const [total, setTotal] = useState<number>(0);

    // Calculate price based on delay type
    useEffect(() => {
        let currentPricePerUnit = 300;
        setPricePerUnit(currentPricePerUnit);
    }, []);


    // Calculate total cost
    useEffect(() => {
        let adjustedPricePerUnit = pricePerUnit;
        const calculatedTotal = numRequest * adjustedPricePerUnit;
        setTotal(calculatedTotal);
    }, [numRequest, pricePerUnit]);



    const insufficientFunds = total > userCredit;

    return (
        <div className={`${className} relative px-3`}>
            {formId && showBackButton && (
                <Link
                    href={`/form/${formId}`}
                    className="absolute top-0 left-0 text-gray-600 hover:text-gray-800 p-2"
                    aria-label="Back"
                >
                    <ChevronLeftIcon className="w-6 h-6" />
                </Link>
            )}
            {showTitle && (
                <>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 mt-2 sm:mt-0 text-right sm:text-center">TẠO YÊU CẦU ĐIỀN FORM</h3>
                    {formName && <h6 className="text-sm text-gray-500 mb-4 text-center">{formName}</h6>}
                </>
            )}
            <div className="text-left">
                <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                    <label htmlFor="credit" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Số dư tài khoản:</label>
                    <div className="w-full sm:w-1/2 p-2 rounded">
                        <input type="text" readOnly className="bg-transparent w-full sm:text-right font-bold" id="credit" value={userCredit.toLocaleString() + ' VND'} />
                    </div>
                </div>
                <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                    <label htmlFor="price" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Đơn giá mỗi câu trả lời:</label>
                    <div className="w-full sm:w-1/2 p-2 rounded">
                        <p id="pricePerAnswer" className="sm:text-right font-bold">
                            {pricePerUnit.toLocaleString()} VND
                        </p>
                    </div>
                </div>
                <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
                    <label htmlFor="num_request" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Số lượng câu trả lời cần tăng:</label>
                    <div className="w-full sm:w-1/2">
                        <input
                            type="number"
                            required
                            className="w-full border border-primary-500 rounded px-3 py-2 text-right font-bold"
                            id="num_request"
                            name="num_request"
                            value={numRequest}
                            onChange={(e) => onNumRequestChange(parseInt(e.target.value) || 0)}
                            min="0"
                        />
                    </div>
                </div>

            </div>

            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-6 my-6 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center justify-between border-b border-blue-200 pb-4 mb-4">
                    <h3 className="text-lg sm:text-xl font-bold">TỔNG CỘNG:</h3>
                    <div className="text-2xl font-bold text-blue-700">{total.toLocaleString()} VND</div>
                </div>

                {insufficientFunds && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
                        <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-sm">
                            ❌ KHÔNG ĐỦ SỐ DƯ, BẠN HÃY NẠP THÊM TIỀN NHÉ!
                        </div>
                        <h4 className="text-lg font-bold mb-3 text-center">Nạp thêm <span className="text-red-600">{(total - userCredit).toLocaleString()} VND</span> để tiếp tục</h4>

                        {bankInfo && (
                            <PaymentInformation
                                bankInfo={bankInfo}
                                className="space-y-3 mt-4 bg-gray-50 p-3 rounded-lg"
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreateDownloadOrderForm;
