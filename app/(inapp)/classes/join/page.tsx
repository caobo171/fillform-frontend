import type { Metadata } from 'next';

import { Join } from './Join';

export const metadata: Metadata = {
  title: 'Tham gia lớp học - WELE',
  description: 'Tham gia lớp học',
};

export default function Page() {
  return <Join />;
}
