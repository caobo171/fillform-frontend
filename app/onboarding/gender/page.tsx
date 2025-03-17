import type { Metadata } from 'next';

import { Gender } from './Gender';

export const metadata: Metadata = {
  title: 'Giới tính - Onboarding - WELE',
  description: 'Giới tính - Onboarding - WELE',
};

export default function Page() {
  return <Gender />;
}
