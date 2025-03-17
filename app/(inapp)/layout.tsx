'use client';

import { useLocalStorage } from '@uidotdev/usehooks';
import { usePathname, useRouter } from 'next/navigation';
import { PropsWithChildren, useEffect } from 'react';

import Badge from '@/components/badge/Badge';
import Congrat from '@/components/congrat/Congrat';
import { LayoutFooter } from '@/components/layout/footer/footer';
import { Header } from '@/components/layout/header/Header';
import { SubscriptionBannerTop } from '@/components/subscription/BannerTop';
import { OnboardingStorageKey } from '@/core/Constants';
import { MeHook } from '@/store/me/hooks';
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
