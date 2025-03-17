import { PropsWithChildren } from 'react';

import { Container } from '@/components/layout/container/container';

export default function ClassLayout({ children }: PropsWithChildren) {
  return (
    <div className="bg-gray-50 min-h-screen mb-[-40px] pb-6">
      <Container className="pt-6 pb-10">{children}</Container>
    </div>
  );
}
