import type { Metadata } from 'next';

import { Birthday } from './Birthday';

export const metadata: Metadata = {
  title: 'Ngày sinh - Onboarding - WELE',
  description: 'Ngày sinh - Onboarding - WELE',
};

export default function Page() {
  return <Birthday />;
}
