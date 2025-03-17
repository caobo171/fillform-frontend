import type { Metadata } from 'next';

import NotificationPage from '@/app/(inapp)/user/notifications/NotificationPage';

export const metadata: Metadata = {
  title: 'Thông báo - WELE',
  description: 'Thông báo - WELE',
};

export default function Page() {
  return <NotificationPage />;
}
