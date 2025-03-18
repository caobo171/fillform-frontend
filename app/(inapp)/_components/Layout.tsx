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

export default function NormalLayout({ children }: PropsWithChildren) {
  const router = useRouter();

  const me = MeHook.useMe();

  const path = usePathname();

  const [lastOnboarding] = useLocalStorage(OnboardingStorageKey, null);

  // redirect to onboarding if user has not completed onboarding
  useEffect(() => {
    const current = new Date().getTime();

    const lastTimeOnboarding = lastOnboarding
      ? new Date(lastOnboarding).getTime()
      : 0;

    const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000;

    // ask user to complete onboarding if it's been a week since last time
    const isOnboardingExpired =
      current - lastTimeOnboarding > oneWeekInMilliseconds;

    if (
      isOnboardingExpired &&
      me?.id && // make sure user data is loaded
      !me?.city &&
      !path.includes('/onboarding')
    ) {
      router.push('/onboarding/welcome');
    }
  }, [lastOnboarding, me, path, router]);

  return (
    <div className="min-h-full">
      <Header
        searchUrl="podcasts"
        menu={{
          main: [
            { name: 'Tài khoản', href: '/home' },
            { name: 'Tạo form ngay', href: '/form/create' },
            { name: 'Mã hoá data', href: '/data/encode' },
            { name: 'Nạp tiền', href: '/credit' },
          ],
          subs: []
        }}
      />

      <Badge />

      <Congrat />

      <main className="relative min-h-screen pt-14">
        <SubscriptionBannerTop />

        {children}
      </main>

      <LayoutFooter />
    </div>
  );
}
