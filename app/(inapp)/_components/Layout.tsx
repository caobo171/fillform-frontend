'use client';
import { useRouter } from 'next/navigation';
import { PropsWithChildren } from 'react';

import Congrat from '@/components/congrat/Congrat';
import { LayoutFooter } from '@/components/layout/footer/footer';
import { Header } from '@/components/layout/header/Header';
import { SubscriptionBannerTop } from '@/components/subscription/BannerTop';
import { MeHook } from '@/store/me/hooks';
import { useMe } from '@/hooks/user';
import ACL from '@/services/ACL';

export default function NormalLayout({ children }: PropsWithChildren) {
  const router = useRouter();

  const me = useMe();


  let tabs = [
    { name: 'Tài khoản', href: '/' },
    { name: 'Tạo form ngay', href: '/form/create' },
    { name: 'Mã hoá data', href: '/data/encode' },
    { name: 'Build dữ liệu đẹp', href: '/data/builder', id: 'build_data' },
    { name: 'Nạp tiền', href: '/credit' },
    { name: 'Về fillform', href: 'https://fillform.info' },
  ];


  // If not super admin and not beta tester
  if (!me?.data || (!me.data.is_super_admin && !ACL.isBetaTester(me.data))) {
    tabs = tabs.filter(e => e.id !== 'build_data');
  }



  return (
    <div className="min-h-full js-main-layout overflow-x-hidden">
      <Header
        searchUrl="podcasts"
        menu={{
          main: tabs,
          subs: []
        }}
      />

      <Congrat />

      <main className="relative min-h-screen pt-14">
        <SubscriptionBannerTop />

        {children}
      </main>

      <LayoutFooter />
    </div>
  );
}
