import React, { useEffect, useState, useRef } from 'react';
import { OPTIONS_DELAY, OPTIONS_DELAY_ENUM } from '@/core/Constants';
import PaymentInformation from '../common/PaymentInformation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface CreateOrderFormProps {
  userCredit: number;
  numRequest: number;
  delayType: number;
  numRequestReadOnly?: boolean;
  formId?: string;
  formName?: string;
  bankInfo?: any;
  onNumRequestChange: (value: number) => void;
  onDelayTypeChange: (value: number) => void;
  className?: string;
  showTitle?: boolean;
  showBackButton?: boolean;
}

// Custom hook for handling clicks outside an element (for dropdown)
const useOnClickOutside = (ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};

const CreateOrderForm: React.FC<CreateOrderFormProps> = ({
  userCredit,
  numRequest,
  delayType,
  numRequestReadOnly = false,
  formId,
  formName,
  bankInfo,
  onNumRequestChange,
  onDelayTypeChange,
  className = '',
  showTitle = true,
  showBackButton = true
}) => {
  const [pricePerUnit, setPricePerUnit] = useState<number>(OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price);
  const [total, setTotal] = useState<number>(0);
  const [delayInfo, setDelayInfo] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  // Calculate price based on delay type
  useEffect(() => {
    let currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
    let delayMessage = '';

    switch (delayType) {
      case OPTIONS_DELAY_ENUM.SHORT_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price;
        delayMessage = `Bill điền rải ngắn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 5 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 2 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      case OPTIONS_DELAY_ENUM.STANDARD_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price;
        delayMessage = `Bill điền rải tiêu chuẩn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 10 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 12 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      case OPTIONS_DELAY_ENUM.LONG_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price;
        delayMessage = `Bill điền rải dài có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 20 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và cần bạn bật lại tiếp tục chạy vào vào ngày hôm sau.</b>. Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 24 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      default:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
        delayMessage = `Không có điền rải dãn cách. Đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price} VND / 1 mẫu trả lời. Kết quả lên ngay tức thì (Không bị giới hạn thời gian, khoảng mỗi mẫu cách nhau khoảng 1s).`;
        break;
    }

    setPricePerUnit(currentPricePerUnit);
    setDelayInfo(delayMessage);
  }, [delayType]);

  // Calculate total cost
  useEffect(() => {
    const calculatedTotal = numRequest * pricePerUnit;
    setTotal(calculatedTotal);
  }, [numRequest, pricePerUnit]);



  const insufficientFunds = total > userCredit;
  const submitDisabled = insufficientFunds || numRequest <= 0;

  return (
    <div className={`${className} relative px-3 sm:px-0`}>      
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
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center border-b pb-3">
          <label htmlFor="credit" className="w-full sm:w-1/2 font-medium mb-2 sm:mb-0 text-gray-700">Số dư tài khoản:</label>
          <div className="w-full sm:w-1/2 p-2 rounded">
            <input type="text" readOnly className="bg-transparent w-full sm:text-right font-bold text-blue-600" id="credit" value={userCredit.toLocaleString() + ' VND'} />
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center border-b pb-3">
          <label htmlFor="price" className="w-full sm:w-1/2 font-medium mb-2 sm:mb-0 text-gray-700">Đơn giá mỗi câu trả lời:</label>
          <div className="w-full sm:w-1/2  p-2 rounded">
            <p id="pricePerAnswer" className="sm:text-right font-bold text-blue-600">{pricePerUnit.toLocaleString()} VND</p>
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center border-b pb-3">
          <label htmlFor="num_request" className="w-full sm:w-1/2 font-medium mb-2 sm:mb-0 text-gray-700">Số lượng câu trả lời cần tăng:</label>
          <div className="w-full sm:w-1/2">
            <input
              type="number"
              required
              className="w-full border border-gray-300 rounded px-3 py-2 text-right font-bold text-blue-600"
              id="num_request"
              name="num_request"
              value={numRequest}
              onChange={(e) => onNumRequestChange(parseInt(e.target.value) || 0)}
              readOnly={numRequestReadOnly}
              min="0"
            />
          </div>
        </div>
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center">
          <label htmlFor="delay" className="w-full sm:w-1/2 font-medium mb-2 sm:mb-0 text-gray-700">Điền rải random như người thật:</label>
          <div className="w-full sm:w-1/2">
            {/* Custom dropdown with descriptions */}
            <div className="relative" ref={dropdownRef}>
              <div 
                className="w-full border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate font-bold text-blue-600">{OPTIONS_DELAY[delayType].name}</span>
                  <svg className="flex-shrink-0 fill-current h-4 w-4 ml-1 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
              
              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {Object.keys(OPTIONS_DELAY).map(key => {
                    const option = OPTIONS_DELAY[parseInt(key)];
                    const keyNum = parseInt(key);
                    const description = keyNum === OPTIONS_DELAY_ENUM.NO_DELAY ?
                      "Không có điền rải giãn cách" :
                      `Điền rải giãn cách từ ${keyNum === OPTIONS_DELAY_ENUM.SHORT_DELAY ? "1-5" :
                        keyNum === OPTIONS_DELAY_ENUM.STANDARD_DELAY ? "1-10" : "1-20"} phút`;
                    
                    return (
                      <div 
                        key={key} 
                        className={`p-3 hover:bg-gray-100 cursor-pointer ${parseInt(key) === delayType ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        onClick={() => {
                          onDelayTypeChange(parseInt(key));
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="font-medium">{option.name}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-6 my-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-blue-200 pb-4 mb-4">
          <h3 className="text-lg sm:text-xl font-bold">TỔNG CỘNG:</h3>
          <div className="text-2xl font-bold text-blue-700">{total.toLocaleString()} VND</div>
        </div>
        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 w-full" dangerouslySetInnerHTML={{ __html: delayInfo }}></p>
        </div>
        
        {insufficientFunds && (
          <div className="mt-4 p-4 bg-white rounded-lg border border-red-100">
            <div className="p-3 bg-red-100 text-red-700 rounded-lg mb-4 text-center font-medium">
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

export default CreateOrderForm;
