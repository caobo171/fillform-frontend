import type { Metadata } from 'next';

import { Onboarding } from './Welcome';
import { ClientOnly } from '@/components/common/ClientOnly';

export const metadata: Metadata = {
  title: 'Welcome - Onboarding - WELE',
  description: 'Welcome - Onboarding - WELE',
};

export default function Page() {
  return <ClientOnly>
    <Onboarding />
  </ClientOnly>;
}
