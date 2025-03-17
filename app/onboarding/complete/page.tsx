import type { Metadata } from 'next';

import { Complete } from './Complete';

export const metadata: Metadata = {
  title: 'Hoàn thành - Onboarding - WELE',
  description: 'Hoàn thành - Onboarding - WELE',
};

export default function Page() {
  return <Complete />;
}
