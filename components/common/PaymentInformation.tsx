import Image from 'next/image';
import { useState } from 'react';

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
  className = "space-y-3" 
}: PaymentInformationProps) => {
  const accountName = "VUONG TIEN DAT";
  
  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here if you have one
  };

  if (!bankInfo?.data) {
    return null;
  }

  return (
    <div className={className}>
      <div className="flex items-center">
        <span className="w-1/3 font-medium text-gray-700">Tên Ngân Hàng</span>
        <div className="flex items-center gap-2">
          <button onClick={() => copyText(bankInfo.data?.name || "")} className="hover:opacity-70 bg-gray-100 p-1 rounded">📋</button>
          <span>{bankInfo.data?.name}</span>
        </div>
      </div>

      <div className="flex items-center">
        <span className="w-1/3 font-medium text-gray-700">Số Tài Khoản</span>
        <div className="flex items-center gap-2">
          <button onClick={() => copyText(bankInfo.data?.number || "")} className="hover:opacity-70 bg-gray-100 p-1 rounded">📋</button>
          <span>{bankInfo.data?.number}</span>
        </div>
      </div>

      <div className="flex items-center">
        <span className="w-1/3 font-medium text-gray-700">Tên Tài Khoản</span>
        <div className="flex items-center gap-2">
          <button onClick={() => copyText(accountName)} className="hover:opacity-70 bg-gray-100 p-1 rounded">📋</button>
          <span>{accountName}</span>
        </div>
      </div>

      <div className="flex items-center">
        <span className="w-1/3 font-medium text-gray-700">Nội dung chuyển tiền</span>
        <div className="flex items-center gap-2">
          <button onClick={() => copyText(bankInfo.data?.message_credit || "")} className="hover:opacity-70 bg-gray-100 p-1 rounded">📋</button>
          <span>{bankInfo.data?.message_credit}</span>
        </div>
      </div>

      <div className="flex items-start">
        <span className="w-1/3 font-medium text-gray-700">Mã QR</span>
        <div className="flex items-center gap-2">
          <Image
            src={bankInfo.data?.qr_link || ""}
            alt="QRCode"
            width={200}
            height={200}
            className="w-[200px] h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentInformation;
