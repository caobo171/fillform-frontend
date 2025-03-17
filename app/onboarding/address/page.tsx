import type { Metadata } from 'next';

import { Address } from './Address';

export const metadata: Metadata = {
  title: 'Địa chỉ - Onboarding - WELE',
  description: 'Địa chỉ - Onboarding - WELE',
};

export default function Page() {
  return <Address />;
}
