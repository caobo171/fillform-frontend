import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/common';

export function PremiumWarning() {
  return (
    <div className="flex flex-col gap-2 w-full justify-center items-center py-10">
      <img
        src="/static/svg/crown.svg"
        alt="premium"
        className="w-[72px] h-[72px]"
      />

      <p className="text-base text-gray-900 mb-4">
        Tính năng này chỉ dành cho tài khoản Premium
      </p>

      <Link href="/user/plans">
        <Button>Nâng cấp Premium</Button>
      </Link>
    </div>
  );
}



export function PremiumPaidWarning() {
  return (
    <div className="flex flex-col gap-2 w-full justify-center items-center py-10">
      <img
        src="/static/svg/crown.svg"
        alt="premium"
        className="w-[72px] h-[72px]"
      />

      <p className="text-base text-gray-900 mb-4">
        Tính năng này chỉ dành cho tài khoản Premium đã thanh toán (không bao gồm dùng thử)
      </p>

      <Link href="/user/plans">
        <Button>Nâng cấp Premium</Button>
      </Link>
    </div>
  );
}
