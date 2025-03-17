import type { Metadata } from 'next';

import { ChangePasswordPage } from '@/app/(inapp)/user/change-password/ChangePasswordPage';

export const metadata: Metadata = {
  title: 'Thay đổi mật khẩu - WELE',
  description: 'Thay đổi mật khẩu - WELE',
};

export default function Page() {
  return <ChangePasswordPage />;
}
