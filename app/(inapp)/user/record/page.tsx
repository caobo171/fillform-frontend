import { Metadata } from 'next';

import { RecordPage } from '@/app/(inapp)/user/record/RecordPage';

export const metadata: Metadata = {
  title: 'Phân tích thành tựu - WELE',
  description: 'Phân tích thành tựu - WELE',
};

export default function Page() {
  return <RecordPage />;
}
