import { Metadata } from 'next';

import { Task } from '@/app/admin/task/Task';

export const metadata: Metadata = {
  title: 'Task - WELE',
  description: 'Task - WELE',
};

export default function Page() {
  return <Task />;
}
