import React, { useEffect, useState, useRef } from 'react';
import { AI_PRICE, OPTIONS_DELAY, OPTIONS_DELAY_ENUM, ORDER_TYPE, MODEL_PRICE, MODERATE_VARIABLE_PRICE, MEDIATOR_VARIABLE_PRICE, DEPENDENT_VARIABLE_PRICE, INDEPENDENT_VARIABLE_PRICE, READ_RESULT_PRICE } from '@/core/Constants';
import PaymentInformation from '../common/PaymentInformation';
import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useMe } from '@/hooks/user';

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
  scheduleEnabled?: boolean;
  startTime?: string;
  endTime?: string;
  disabledDays?: number[];
  orderType?: string;
  modelMode?: string;


  numModerateVariables?: number;
  numMediatorVariables?: number;
  numIndependentVariables?: number;
  numDependentVariables?: number;
  onScheduleEnabledChange?: (value: boolean) => void;
  onStartTimeChange?: (value: string) => void;
  onEndTimeChange?: (value: string) => void;
  onDisabledDaysChange?: (value: number[]) => void;

  isReadingAnalysisResult?: boolean;
  onIsReadingAnalysisResultChange?: (value: boolean) => void;

  // New props for SPECIFIC_DELAY
  specificStartDate?: string;
  specificEndDate?: string;
  specificDailySchedules?: {
    date: string;
    startTime: string;
    endTime: string;
    enabled: boolean;
  }[];
  onSpecificStartDateChange?: (value: string) => void;
  onSpecificEndDateChange?: (value: string) => void;
  onSpecificDailySchedulesChange?: (value: any[]) => void;
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
  showBackButton = true,
  scheduleEnabled = true,
  startTime = '08:00',
  endTime = '20:00',
  disabledDays = [],
  orderType = ORDER_TYPE.AUTOFILL,
  modelMode = 'basic',
  numModerateVariables = 0,
  numMediatorVariables = 0,
  numIndependentVariables = 0,
  numDependentVariables = 0,
  onScheduleEnabledChange = () => { },
  onStartTimeChange = () => { },
  onEndTimeChange = () => { },
  onDisabledDaysChange = () => { },
  // New props for SPECIFIC_DELAY with defaults
  specificStartDate = new Date().toISOString().split('T')[0],
  specificEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  specificDailySchedules = [],
  onSpecificStartDateChange = () => { },
  onSpecificEndDateChange = () => { },
  onSpecificDailySchedulesChange = () => { },
  isReadingAnalysisResult = false,
  onIsReadingAnalysisResultChange = () => { }
}) => {
  const user = useMe();
  const [pricePerUnit, setPricePerUnit] = useState<number>(OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price);
  const [total, setTotal] = useState<number>(0);
  const [delayInfo, setDelayInfo] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [schedulePriceAdjustment, setSchedulePriceAdjustment] = useState<number>(0);
  const [daysDropdownOpen, setDaysDropdownOpen] = useState<boolean>(false);
  const [localScheduleEnabled, setLocalScheduleEnabled] = useState<boolean>(scheduleEnabled);
  const [localStartTime, setLocalStartTime] = useState<string>(startTime);
  const [localEndTime, setLocalEndTime] = useState<string>(endTime);
  const [localDisabledDays, setLocalDisabledDays] = useState<number[]>(disabledDays);

  // New state variables for SPECIFIC_DELAY
  const [localSpecificStartDate, setLocalSpecificStartDate] = useState<string>(specificStartDate);
  const [localSpecificEndDate, setLocalSpecificEndDate] = useState<string>(specificEndDate);
  const [localSpecificDailySchedules, setLocalSpecificDailySchedules] = useState<any[]>(specificDailySchedules);
  const [isGeneratingSchedules, setIsGeneratingSchedules] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));

  const daysDropdownRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(daysDropdownRef, () => setDaysDropdownOpen(false));

  const isSPSSModel = numModerateVariables <= 0 && numMediatorVariables <= 0 && numIndependentVariables > 1 && numDependentVariables == 1;

  // Calculate price based on delay type
  useEffect(() => {
    let currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
    let delayMessage = '';

    switch (delayType) {
      case OPTIONS_DELAY_ENUM.SHORT_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price;
        delayMessage = `Bill điền rải ngắn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SHORT_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 5 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. ${!localScheduleEnabled ? 'Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và bật lại vào 7h hôm sau.</b>' : ''} Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 2 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      case OPTIONS_DELAY_ENUM.STANDARD_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price;
        delayMessage = `Bill điền rải tiêu chuẩn có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.STANDARD_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 10 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. ${!localScheduleEnabled ? 'Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và bật lại vào 7h hôm sau.</b>' : ''} Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 12 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      case OPTIONS_DELAY_ENUM.LONG_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price;
        delayMessage = `Bill điền rải dài có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.LONG_DELAY].price} VND / 1 mẫu trả lời. Rải giãn cách từ <b>1 đến 20 phút</b> Bạn có thể dừng lại / tiếp tục tùy nhu cầu bản thân. ${!localScheduleEnabled ? 'Tool sẽ tự động dừng điền rải trước 22h mỗi ngày và bật lại vào 7h hôm sau.</b>' : ''} Thời gian hoàn thành 100 mẫu tiêu chuẩn là khoảng 24 giờ. (có thể thay đổi lớn phụ thuộc vào số lượng người dùng)`;
        break;
      case OPTIONS_DELAY_ENUM.SPECIFIC_DELAY:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SPECIFIC_DELAY].price;
        delayMessage = `Bill điền rải xác định thời gian có đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.SPECIFIC_DELAY].price} VND / 1 mẫu trả lời. Bạn có thể chọn chính xác thời gian bắt đầu và kết thúc (tối đa 7 ngày). Bạn có thể tùy chỉnh thời gian chạy cho từng ngày cụ thể.`;
        break;
      default:
        currentPricePerUnit = OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price;
        delayMessage = `Không có điền rải dãn cách. Đơn giá ${OPTIONS_DELAY[OPTIONS_DELAY_ENUM.NO_DELAY].price} VND / 1 mẫu trả lời. Kết quả lên ngay tức thì (Không bị giới hạn thời gian, khoảng mỗi mẫu cách nhau khoảng 1s).`;
        break;
    }

    // Temporarily
    if (orderType === ORDER_TYPE.AGENT) {
      currentPricePerUnit = currentPricePerUnit + AI_PRICE;
    }

    setPricePerUnit(currentPricePerUnit);
    setDelayInfo(delayMessage);
  }, [delayType, localScheduleEnabled, orderType, modelMode, numModerateVariables, numMediatorVariables]);

  // Sync local state with props
  useEffect(() => {
    setLocalScheduleEnabled(scheduleEnabled);
    setLocalStartTime(startTime);
    setLocalEndTime(endTime);
    setLocalDisabledDays(disabledDays);

  }, [scheduleEnabled, startTime, endTime, disabledDays.join(',')]);


  // Update specific daily schedules
  useEffect(() => {
    const startDate = specificStartDate || new Date().toISOString().split('T')[0];
    const endDate = specificEndDate || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    setLocalSpecificStartDate(startDate);
    setLocalSpecificEndDate(endDate);

    if (handleSpecificStartDateChange) {
      handleSpecificStartDateChange(startDate);
    }

    if (handleSpecificEndDateChange) {
      handleSpecificEndDateChange(endDate);
    }

    if (specificDailySchedules && specificDailySchedules.length > 0) {
      setLocalSpecificDailySchedules(specificDailySchedules);
    }
  }, [specificStartDate, specificEndDate, specificDailySchedules.map(e => `${e.date}-${e.enabled}-${e.startTime}-${e.endTime}`).join(',')]);

  // Update schedule price adjustment
  useEffect(() => {
    if (delayType === OPTIONS_DELAY_ENUM.SPECIFIC_DELAY) {
      setSchedulePriceAdjustment(0); // No add-on fee for specific delay scheduling
    } else if (localScheduleEnabled) {
      setSchedulePriceAdjustment(50); // +50 VND per request when regular scheduling is enabled
    } else {
      setSchedulePriceAdjustment(0);
    }
  }, [localScheduleEnabled, delayType]);

  // Initialize specific delay schedules when delay type changes to SPECIFIC_DELAY
  useEffect(() => {
    if (delayType === OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && localSpecificDailySchedules.length === 0) {
      generateDailySchedules(localSpecificStartDate, localSpecificEndDate);
    }
  }, [delayType]);

  // Handle schedule changes with error handling to prevent issues
  const handleScheduleEnabledChange = (value: boolean) => {
    try {
      setLocalScheduleEnabled(value);
      // Only call the parent handler if it's a function
      if (typeof onScheduleEnabledChange === 'function') {
        onScheduleEnabledChange(value);
      }
    } catch (error) {
      console.error('Error toggling schedule:', error);
      // Ensure the local state is updated even if parent handler fails
      setLocalScheduleEnabled(value);
    }
  };

  const handleStartTimeChange = (value: string) => {
    try {
      setLocalStartTime(value);
      if (typeof onStartTimeChange === 'function') {
        onStartTimeChange(value);
      }
    } catch (error) {
      console.error('Error changing start time:', error);
      setLocalStartTime(value);
    }
  };

  const handleEndTimeChange = (value: string) => {
    try {
      setLocalEndTime(value);
      if (typeof onEndTimeChange === 'function') {
        onEndTimeChange(value);
      }
    } catch (error) {
      console.error('Error changing end time:', error);
      setLocalEndTime(value);
    }
  };

  const handleDisabledDaysChange = (value: number[]) => {
    try {
      setLocalDisabledDays(value);
      if (typeof onDisabledDaysChange === 'function') {
        onDisabledDaysChange(value);
      }
    } catch (error) {
      console.error('Error changing disabled days:', error);
      setLocalDisabledDays(value);
    }
  };

  // New handlers for SPECIFIC_DELAY
  const handleSpecificStartDateChange = (value: string) => {
    try {
      setLocalSpecificStartDate(value);
      if (typeof onSpecificStartDateChange === 'function') {
        onSpecificStartDateChange(value);
      }
      // Generate new schedules when start date changes
      generateDailySchedules(value, localSpecificEndDate);
    } catch (error) {
      console.error('Error changing specific start date:', error);
      setLocalSpecificStartDate(value);
    }
  };

  const handleSpecificEndDateChange = (value: string) => {
    try {
      setLocalSpecificEndDate(value);
      if (typeof onSpecificEndDateChange === 'function') {
        onSpecificEndDateChange(value);
      }
      // Generate new schedules when end date changes
      generateDailySchedules(localSpecificStartDate, value);
    } catch (error) {
      console.error('Error changing specific end date:', error);
      setLocalSpecificEndDate(value);
    }
  };

  const handleSpecificDailyScheduleChange = (index: number, field: string, value: any) => {
    try {
      const updatedSchedules = [...localSpecificDailySchedules];
      updatedSchedules[index] = {
        ...updatedSchedules[index],
        [field]: value
      };
      setLocalSpecificDailySchedules(updatedSchedules);
      if (typeof onSpecificDailySchedulesChange === 'function') {
        onSpecificDailySchedulesChange(updatedSchedules);
      }
    } catch (error) {
      console.error('Error changing specific daily schedule:', error);
    }
  };

  // State for date validation warnings
  const [startDateWarning, setStartDateWarning] = useState<string>('');
  const [endDateWarning, setEndDateWarning] = useState<string>('');

  // Generate daily schedules between start and end date
  const generateDailySchedules = (startDate: string, endDate: string) => {
    try {
      setIsGeneratingSchedules(true);
      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Clear previous warnings
      setStartDateWarning('');
      setEndDateWarning('');

      // Validate start date is not in the past
      if (start < today) {
        setStartDateWarning('Ngày bắt đầu không thể trong quá khứ');
        setIsGeneratingSchedules(false);
        return;
      }

      // Validate dates
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        console.error('Invalid date format');
        setIsGeneratingSchedules(false);
        return;
      }

      // Validate start date is before end date
      if (start > end) {
        setEndDateWarning('Ngày kết thúc phải sau ngày bắt đầu');
        setIsGeneratingSchedules(false);
        return;
      }

      // Check if duration is more than 7 days
      const maxDuration = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      if (end.getTime() - start.getTime() > maxDuration) {
        setEndDateWarning('Thời gian chạy tối đa là 7 ngày');
        // Don't automatically adjust the date, just show warning
        setIsGeneratingSchedules(false);
        return;
      }

      const schedules = [];
      const currentDate = new Date(start);

      // Loop through each day in the range
      while (currentDate <= end) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const isFirstDay = dateStr === startDate;
        const isLastDay = dateStr === endDate;

        // Find if this date already exists in the current schedules
        const existingSchedule = localSpecificDailySchedules.find(s => s.date === dateStr);

        if (existingSchedule) {
          schedules.push(existingSchedule);
        } else {
          schedules.push({
            date: dateStr,
            startTime: '08:00', // First day starts at midnight
            endTime: '20:00', // Last day ends at midnight
            enabled: true
          });
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setLocalSpecificDailySchedules(schedules);
      if (typeof onSpecificDailySchedulesChange === 'function') {
        onSpecificDailySchedulesChange(schedules);
      }
    } catch (error) {
      console.error('Error generating daily schedules:', error);
    } finally {
      setIsGeneratingSchedules(false);
    }
  };

  // Calculate total cost
  useEffect(() => {
    let adjustedPricePerUnit = pricePerUnit + schedulePriceAdjustment;
    let calculatedTotal = numRequest * adjustedPricePerUnit;

    // Add Data Model variable pricing (for DATA_MODEL order type)
    if (orderType === ORDER_TYPE.DATA_MODEL) {
      let modelBuilderPrice = 0;
      modelBuilderPrice += (numModerateVariables || 0) * MODERATE_VARIABLE_PRICE;
      modelBuilderPrice += (numMediatorVariables || 0) * MEDIATOR_VARIABLE_PRICE;
      modelBuilderPrice += (numIndependentVariables || 0) * INDEPENDENT_VARIABLE_PRICE;
      modelBuilderPrice += (numDependentVariables || 0) * DEPENDENT_VARIABLE_PRICE;

      calculatedTotal += modelBuilderPrice;

      // Add-on fixed fee for Vietnamese SPSS result translation
      if (isReadingAnalysisResult) {
        calculatedTotal += READ_RESULT_PRICE;
      }
    }

    setTotal(calculatedTotal);
  }, [numRequest, pricePerUnit, schedulePriceAdjustment, orderType, numModerateVariables, numMediatorVariables, numIndependentVariables, numDependentVariables, isReadingAnalysisResult]);



  const insufficientFunds = total > userCredit;
  const submitDisabled = insufficientFunds || numRequest <= 0;

  return (
    <div className={`${className} relative`}>
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
            <p id="pricePerAnswer" className="sm:text-right font-bold text-blue-600">
              {(pricePerUnit + schedulePriceAdjustment).toLocaleString()} VND
            </p>
            <p className="sm:text-right text-xs text-gray-500 mt-1">
              (Xem chi tiết bên dưới)
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
              readOnly={numRequestReadOnly}
              min="0"
            />
          </div>
        </div>
        
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
          <label htmlFor="delay" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Điền rải random như người thật:</label>
          <div className="w-full sm:w-1/2">
            {/* Custom dropdown with descriptions */}
            <div className="relative" ref={dropdownRef}>
              <div
                className="w-full border border-primary-500 rounded px-3 py-2 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate font-bold">{OPTIONS_DELAY[delayType].name}</span>
                  <svg className="flex-shrink-0 fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              {isDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                  {Object.keys(OPTIONS_DELAY).map(key => {
                    const option = OPTIONS_DELAY[parseInt(key)];
                    const description = option.description;

                    return (
                      <div
                        key={key}
                        className={`p-3 hover:bg-gray-100 cursor-pointer ${parseInt(key) === delayType ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                        onClick={() => {
                          onDelayTypeChange(parseInt(key));
                          setIsDropdownOpen(false);
                        }}
                      >
                        <div className="font-sm">{option.name}</div>
                        <div className="text-sm text-gray-500">{description}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Options - Only show for non-SPECIFIC_DELAY types */}
        {delayType !== OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && (
          <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="schedule" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Đặt giờ chạy:</label>
            <div className="w-full sm:w-1/2">
              <div
                className="flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  handleScheduleEnabledChange(!localScheduleEnabled);
                }}
              >
                <input
                  type="checkbox"
                  id="schedule-enabled"
                  checked={localScheduleEnabled}
                  onChange={(e) => {
                    e.stopPropagation(); // Prevent event bubbling
                    handleScheduleEnabledChange(!localScheduleEnabled); // Toggle directly instead of using e.target.checked
                  }}
                  className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="schedule-enabled"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Bật lịch trình (+50 VND/yêu cầu)
                  {!localScheduleEnabled && delayType !== OPTIONS_DELAY_ENUM.NO_DELAY && (
                    <span className="block text-xs text-red-500 mt-1 font-sm">
                      Lưu ý: Nếu không bật lịch trình, yêu cầu sẽ tự động dừng từ 22h đến 7h hôm sau
                    </span>
                  )}
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Regular Schedule Options */}
        {delayType !== OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && localScheduleEnabled && (
          <>
            <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
              <label className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Thời gian chạy trong ngày:</label>
              <div className="w-full sm:w-1/2 flex space-x-2">
                <div className="flex-1">
                  <label htmlFor="start-time" className="block text-xs text-gray-500 mb-1">Từ</label>
                  <input
                    type="time"
                    id="start-time"
                    value={localStartTime}
                    onChange={(e) => handleStartTimeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
                <div className="flex-1">
                  <label htmlFor="end-time" className="block text-xs text-gray-500 mb-1">Đến</label>
                  <input
                    type="time"
                    id="end-time"
                    value={localEndTime}
                    onChange={(e) => handleEndTimeChange(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
              <label className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Ngày <span className="font-bold text-red-600">KHÔNG</span> chạy trong tuần:</label>
              <div className="w-full sm:w-1/2">
                <div className="relative" ref={daysDropdownRef}>
                  <div
                    className="w-full border border-gray-300 rounded px-3 py-2 bg-white cursor-pointer hover:border-blue-400 transition-colors"
                    onClick={() => setDaysDropdownOpen(!daysDropdownOpen)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="truncate font-sm">
                        {localDisabledDays.length === 0
                          ? 'Chạy tất cả các ngày'
                          : localDisabledDays
                            .map(day => ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][day])
                            .join(', ')}
                      </span>
                      <svg className="flex-shrink-0 fill-current h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>

                  {daysDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded shadow-lg">
                      {[0, 1, 2, 3, 4, 5, 6].map(day => {
                        const dayNames = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
                        const isSelected = localDisabledDays.includes(day);

                        return (
                          <div
                            key={day}
                            className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center ${isSelected ? 'bg-blue-50' : ''}`}
                            onClick={() => {
                              const newDisabledDays = isSelected
                                ? localDisabledDays.filter(d => d !== day)
                                : [...localDisabledDays, day];
                              handleDisabledDaysChange(newDisabledDays);
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => { }}
                              className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded mr-2"
                            />
                            <span>{dayNames[day]}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* SPECIFIC_DELAY Schedule Options */}
        {delayType === OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && (
          <div className="border border-blue-200 rounded-lg p-4 mb-4 bg-blue-50">
            <h4 className="font-bold text-blue-800 mb-3">Chọn thời gian chạy chính xác (+0 VND/yêu cầu)</h4>

            {/* Date Range Selection */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="specific-start-date" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu:</label>
                <input
                  type="date"
                  id="specific-start-date"
                  min={new Date().toISOString().split('T')[0]}
                  value={localSpecificStartDate}
                  onChange={(e) => handleSpecificStartDateChange(e.target.value)}
                  className={`w-full border ${startDateWarning ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                />
                {startDateWarning && (
                  <p className="text-red-500 text-xs mt-1">{startDateWarning}</p>
                )}
              </div>
              <div>
                <label htmlFor="specific-end-date" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (tối đa 7 ngày):</label>
                <input
                  type="date"
                  id="specific-end-date"
                  value={localSpecificEndDate}
                  onChange={(e) => handleSpecificEndDateChange(e.target.value)}
                  className={`w-full border ${endDateWarning ? 'border-red-500' : 'border-gray-300'} rounded px-3 py-2`}
                />
                {endDateWarning && (
                  <p className="text-red-500 text-xs mt-1">{endDateWarning}</p>
                )}
              </div>
            </div>

            {/* Daily Schedule Configuration */}
            <div className="mb-2">
              <h5 className="font-medium text-gray-700 mb-2">Đặt giờ chạy theo ngày:</h5>

              {isGeneratingSchedules ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Đang tạo lịch trình...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {localSpecificDailySchedules.map((schedule, index) => {
                    const date = new Date(schedule.date);
                    const isFirstDay = index === 0;
                    const isLastDay = index === localSpecificDailySchedules.length - 1;
                    const formattedDate = date.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

                    return (
                      <div key={schedule.date} className="border border-gray-200 rounded-lg p-3 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="font-medium">{formattedDate}</div>
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`day-enabled-${index}`}
                              checked={schedule.enabled}
                              onChange={(e) => handleSpecificDailyScheduleChange(index, 'enabled', e.target.checked)}
                              className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`day-enabled-${index}`} className="ml-2 text-sm text-gray-700">
                              Bật
                            </label>
                          </div>
                        </div>

                        {schedule.enabled && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label htmlFor={`day-start-${index}`} className="block text-xs text-gray-500 mb-1">Bắt đầu</label>
                              <input
                                type="time"
                                id={`day-start-${index}`}
                                value={schedule.startTime}
                                onChange={(e) => handleSpecificDailyScheduleChange(index, 'startTime', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              // All days can change start time
                              />
                              {isFirstDay && (
                                <p className="text-xs text-gray-500 mt-1">Ngày đầu tiên</p>
                              )}
                            </div>
                            <div>
                              <label htmlFor={`day-end-${index}`} className="block text-xs text-gray-500 mb-1">Kết thúc</label>
                              <input
                                type="time"
                                id={`day-end-${index}`}
                                value={schedule.endTime}
                                onChange={(e) => handleSpecificDailyScheduleChange(index, 'endTime', e.target.value)}
                                className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              // All days can change end time
                              />
                              {isLastDay && (
                                <p className="text-xs text-gray-500 mt-1">Ngày cuối cùng</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATA_MODEL add-on options */}
        {orderType === ORDER_TYPE.DATA_MODEL && isSPSSModel && (
          <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center">
            <label htmlFor="vn-spss-result" className="w-full sm:w-1/2 font-sm mb-2 sm:mb-0 text-gray-700">Nhận kết quả phân tích SPSS:</label>
            <div className="w-full sm:w-1/2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="vn-spss-result"
                  checked={isReadingAnalysisResult}
                  onChange={(e) => onIsReadingAnalysisResultChange(e.target.checked)}
                  className="h-4 w-4 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="vn-spss-result"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Tick để nhận bản PDF (+{READ_RESULT_PRICE.toLocaleString()} VND phí cố định)
                </label>
              </div>
            </div>
          </div>
        )}

      </div>

      <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-6 my-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-blue-200 pb-4 mb-4">
          <h3 className="text-lg sm:text-xl font-bold">TỔNG CỘNG:</h3>
          <div className="text-2xl font-bold text-blue-700">{total.toLocaleString()} VND</div>
        </div>
        <div className="bg-white rounded-lg p-3 mb-3">
          <p className="text-sm text-gray-700 w-full" dangerouslySetInnerHTML={{ __html: delayInfo }}></p>
        </div>

        {/* Regular Schedule Summary */}
        {delayType !== OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && localScheduleEnabled && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-green-100">
            <h4 className="font-sm text-green-700 mb-2">Lịch trình đã bật:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Thời gian chạy: <span className="font-sm">{localStartTime} - {localEndTime}</span> mỗi ngày</li>
              {localDisabledDays.length > 0 && (
                <li>• Không chạy vào: <span className="font-sm">
                  {localDisabledDays
                    .map(day => ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][day])
                    .join(', ')}
                </span></li>
              )}
              <li>• Phụ phí: <span className="font-sm text-green-600">+{schedulePriceAdjustment} VND/yêu cầu</span></li>
            </ul>
          </div>
        )}



        {/* Pricing Breakdown */}
        <div className="bg-white rounded-lg p-4 mb-3 border border-blue-100">
          <h4 className="font-medium text-blue-800 mb-3">Chi tiết giá:</h4>
          <div className="space-y-2 text-sm">
            {/* Base price */}
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Giá cơ bản ({OPTIONS_DELAY[delayType].name}):</span>
              <span className="font-medium">{OPTIONS_DELAY[delayType].price.toLocaleString()} VND</span>
            </div>

            {/* Agent addon */}
            {orderType === ORDER_TYPE.AGENT && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Phụ phí Agent AI:</span>
                <span className="font-medium text-blue-600">+{AI_PRICE.toLocaleString()} VND</span>
              </div>
            )}


            {/* Schedule addon */}
            {schedulePriceAdjustment > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-700">
                  {delayType === OPTIONS_DELAY_ENUM.SPECIFIC_DELAY ? 'Lịch trình xác định:' : 'Phụ phí lịch trình:'}
                </span>
                <span className="font-medium text-green-600">+{schedulePriceAdjustment.toLocaleString()} VND</span>
              </div>
            )}

            {/* Total per unit */}
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">Tổng đơn giá/yêu cầu:</span>
                <span className="font-bold text-lg text-blue-600">{(pricePerUnit + schedulePriceAdjustment).toLocaleString()} VND</span>
              </div>
            </div>

            {orderType === ORDER_TYPE.DATA_MODEL && (

              <>
                {/* Model Builder Variable Pricing */}
                <div className="bg-gray-50 p-3 rounded-lg mb-4">
                  <h5 className="font-medium text-gray-800 mb-2">Chi phí xây dựng mô hình:</h5>
                  {(numModerateVariables || 0) > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Biến điều tiết ({numModerateVariables} × {MODERATE_VARIABLE_PRICE.toLocaleString()}):
                      </span>
                      <span className="font-medium">
                        {((numModerateVariables || 0) * MODERATE_VARIABLE_PRICE).toLocaleString()} VND
                      </span>
                    </div>
                  )}
                  {(numMediatorVariables || 0) > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Biến trung gian ({numMediatorVariables} × {MEDIATOR_VARIABLE_PRICE.toLocaleString()}):
                      </span>
                      <span className="font-medium">
                        {((numMediatorVariables || 0) * MEDIATOR_VARIABLE_PRICE).toLocaleString()} VND
                      </span>
                    </div>
                  )}
                  {(numIndependentVariables || 0) > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Biến độc lập ({numIndependentVariables} × {INDEPENDENT_VARIABLE_PRICE.toLocaleString()}):
                      </span>
                      <span className="font-medium">
                        {((numIndependentVariables || 0) * INDEPENDENT_VARIABLE_PRICE).toLocaleString()} VND
                      </span>
                    </div>
                  )}
                  {(numDependentVariables || 0) > 0 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Biến phụ thuộc ({numDependentVariables} × {DEPENDENT_VARIABLE_PRICE.toLocaleString()}):
                      </span>
                      <span className="font-medium">
                        {((numDependentVariables || 0) * DEPENDENT_VARIABLE_PRICE).toLocaleString()} VND
                      </span>
                    </div>
                  )}
                </div>

                {/* Vietnamese SPSS result add-on breakdown */}
                {isReadingAnalysisResult && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Kết quả phân tích SPSS  (phí cố định):</span>
                    <span className="font-medium text-purple-700">+{READ_RESULT_PRICE.toLocaleString()} VND</span>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

        {/* Specific Delay Schedule Summary */}
        {delayType === OPTIONS_DELAY_ENUM.SPECIFIC_DELAY && (
          <div className="bg-white rounded-lg p-3 mb-3 border border-green-100">
            <h4 className="font-sm text-green-700 mb-2">Thông tin lịch trình:</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Thời gian chạy: <span className="font-sm">{new Date(localSpecificStartDate).toLocaleDateString('vi-VN')} đến {new Date(localSpecificEndDate).toLocaleDateString('vi-VN')}</span></li>
              <li>• Số ngày chạy: <span className="font-sm">{localSpecificDailySchedules.filter(s => s.enabled).length} ngày</span></li>
            </ul>
          </div>
        )}

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

export default CreateOrderForm;
