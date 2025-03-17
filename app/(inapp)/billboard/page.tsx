import type { Metadata } from 'next';

import { Billboard } from './Billboard';
import { ClientOnly } from '@/components/common/ClientOnly';

export const metadata: Metadata = {
  title: 'Bảng xếp hạng - WELE',
  description: 'Bảng xếp hạng - WELE',
};

export default function Page() {
  return <ClientOnly>
    <Billboard />
  </ClientOnly>;
}
