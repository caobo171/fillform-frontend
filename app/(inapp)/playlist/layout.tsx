import { PropsWithChildren } from 'react';

import { Container } from '@/components/layout/container/container';

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="bg-gray-50 min-h-screen mb-[-40px] pb-6">
      <Container className="py-8">{children}</Container>
    </div>
  );
}
