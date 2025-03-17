import type { Metadata } from 'next';

import { AvatarUpload } from './Avatar';

export const metadata: Metadata = {
  title: 'Ảnh đại diện - Onboarding - WELE',
  description: 'Ảnh đại diện - Onboarding - WELE',
};

export default function Page() {
  return <AvatarUpload />;
}
