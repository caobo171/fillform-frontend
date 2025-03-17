import { Suspense } from 'react';
import { Inner } from '@/app/admin/notifications/_components/notifications';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Notifications - WELE',
}

export default () => {
    return <Suspense>
        <Inner />
    </Suspense>
}
