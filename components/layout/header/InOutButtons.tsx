import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/ui/Button';

export function InOutButtons() {
  const router = useRouter();

  return (
    <div className="flex gap-x-4">
      <Button type="text" onClick={() => router.push('/authentication/login')}>
        Đăng nhập
      </Button>

      <Button
        type="solid"
        onClick={() => router.push('/authentication/register')}
      >
        Đăng ký
      </Button>
    </div>
  );
}
