import type { Metadata } from 'next';

import { Occupation } from './Occupation';

export const metadata: Metadata = {
  title: 'Nghề nghiệp - Onboarding - WELE',
  description: 'Nghề nghiệp - Onboarding - WELE',
};

export default function Page() {
  return <Occupation />;
}
