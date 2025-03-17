import type { Metadata } from 'next';

import { Bio } from './Bio';

export const metadata: Metadata = {
  title: 'Bio - Onboarding - WELE',
  description: 'Bio - Onboarding - WELE',
};

export default function Page() {
  return <Bio />;
}
