'use client';

import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';
import NormalLayout from './_components/Layout';
import { ClientOnly } from '@/components/common/ClientOnly';

export default function InappLayout({ children }: PropsWithChildren) {

  return (
    <ClientOnly>
      <NormalLayout>
        {children}
      </NormalLayout>
    </ClientOnly>

  )
}
