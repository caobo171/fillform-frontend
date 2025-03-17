import { Metadata } from 'next';

import { StudentDetailPage } from '@/app/admin/classes/detail/[id]/user/[user_id]/StudentDetailPage';

export const metadata: Metadata = {
  title: 'Student detail - Class - WELE',
};

export default function Page({
  params,
}: {
  params: { id: string; user_id: string };
}) {
  return (
    <StudentDetailPage
      classId={params.id}
      studentId={params.user_id}
      routerGroup="teacher"
    />
  );
}
