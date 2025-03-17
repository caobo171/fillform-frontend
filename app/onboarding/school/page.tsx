import type { Metadata } from 'next';

import { School } from './School';

export const metadata: Metadata = {
  title: 'Trường học - Onboarding - WELE',
  description: 'Trường học - Onboarding - WELE',
};

export default function Page() {
  return <School />;
}
