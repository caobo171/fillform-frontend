import { Metadata } from 'next';

import { ClassesPage } from '@/app/admin/classes/ClassesPage';

export const metadata: Metadata = {
  title: 'Classes - WELE',
};

export default function Page() {
  return <ClassesPage routerGroup="admin" />;
}
