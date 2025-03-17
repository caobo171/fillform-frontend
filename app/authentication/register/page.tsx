import type { Metadata } from 'next';

import { Register } from '@/app/authentication/register/Register';

export const metadata: Metadata = {
  title: 'Đăng kí tài khoản - WELE',
  description: 'Đăng kí tài khoản - WELE',
};

export default function Page() {
  return <Register />;
}
