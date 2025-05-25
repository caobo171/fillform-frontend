import Image from 'next/image';
import { useState } from 'react';
import { Toast } from '@/services/Toast';

interface BankInfoData {
  name?: string;
  number?: string;
  message_credit?: string;
  qr_link?: string;
}

interface BankInfo {
  data?: BankInfoData;
}

interface PaymentInformationProps {
  bankInfo: BankInfo;
  className?: string;
}

const PaymentInformation = ({ 
  bankInfo, 
  className = "space-y-4" 
}: PaymentInformationProps) => {
  const accountName = "VUONG TIEN DAT";
  const [copied, setCopied] = useState<string | null>(null);
  
  const copyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopied(fieldName);
    Toast.success(`Đã sao chép ${fieldName}`);
    
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  if (!bankInfo?.data) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 border-b pb-3">
        <span className="w-full sm:w-1/3 font-medium text-gray-700">Tên Ngân Hàng</span>
        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={() => copyText(bankInfo.data?.name || "", "tên ngân hàng")} 
            className={`hover:opacity-70 ${copied === "tên ngân hàng" ? 'bg-green-100' : 'bg-gray-100'} p-2 rounded-md text-sm`}
            aria-label="Copy bank name"
          >
            {copied === "tên ngân hàng" ? '✓' : '📋'}
          </button>
          <span className="text-sm sm:text-base break-all">{bankInfo.data?.name}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 border-b pb-3">
        <span className="w-full sm:w-1/3 font-medium text-gray-700">Số Tài Khoản</span>
        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={() => copyText(bankInfo.data?.number || "", "số tài khoản")} 
            className={`hover:opacity-70 ${copied === "số tài khoản" ? 'bg-green-100' : 'bg-gray-100'} p-2 rounded-md text-sm`}
            aria-label="Copy account number"
          >
            {copied === "số tài khoản" ? '✓' : '📋'}
          </button>
          <span className="text-sm sm:text-base break-all">{bankInfo.data?.number}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 border-b pb-3">
        <span className="w-full sm:w-1/3 font-medium text-gray-700">Tên Tài Khoản</span>
        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={() => copyText(accountName, "tên tài khoản")} 
            className={`hover:opacity-70 ${copied === "tên tài khoản" ? 'bg-green-100' : 'bg-gray-100'} p-2 rounded-md text-sm`}
            aria-label="Copy account name"
          >
            {copied === "tên tài khoản" ? '✓' : '📋'}
          </button>
          <span className="text-sm sm:text-base break-all">{accountName}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-0 border-b pb-3">
        <span className="w-full sm:w-1/3 font-medium text-gray-700">Nội dung chuyển tiền</span>
        <div className="flex items-center gap-2 w-full">
          <button 
            onClick={() => copyText(bankInfo.data?.message_credit || "", "nội dung chuyển tiền")} 
            className={`hover:opacity-70 ${copied === "nội dung chuyển tiền" ? 'bg-green-100' : 'bg-gray-100'} p-2 rounded-md text-sm`}
            aria-label="Copy transfer message"
          >
            {copied === "nội dung chuyển tiền" ? '✓' : '📋'}
          </button>
          <span className="text-sm sm:text-base break-all">{bankInfo.data?.message_credit}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-0 pt-1">
        <span className="w-full sm:w-1/3 font-medium text-gray-700">Mã QR</span>
        <div className="flex justify-center sm:justify-start w-full">
          <Image
            src={bankInfo.data?.qr_link || ""}
            alt="QRCode"
            width={200}
            height={200}
            className="w-[150px] sm:w-[200px] h-auto"
            priority
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentInformation;
