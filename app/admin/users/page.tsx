import type { Metadata } from 'next';
import React, { Suspense } from 'react';

import Users from '@/app/admin/users/_components/Users';

export const metadata: Metadata = {
  title: 'Users - Admin - Fillform',
  description: 'Users - Admin - Fillform',
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <Users />
    </Suspense>
  );
}
