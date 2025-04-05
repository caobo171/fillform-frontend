'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { Button } from '@/components/common';
import { Container } from '@/components/layout/container/container';
import Cookie from '@/lib/core/fetch/Cookie';
import DateUtil from '@/services/Date';
import { MeHook } from '@/store/me/hooks';
import { useMe } from '@/hooks/user';

export function SubscriptionBannerTop() {
  const pathname = usePathname();
  const me = useMe();

  const sub = {
    is_effective: true,
    plan: 'premium',
    end_date: new Date().getTime() + 365 * 24 * 3600 * 1000,
    is_freetrial: true,
  };


  const expireIn3Days =
    sub?.is_effective &&
    sub?.plan === 'premium' &&
    (sub?.end_date ?? 0) * 1000 < new Date().getTime() + 3 * 24 * 3600 * 1000;

  const [showBanner, setShowBanner] = useState(false);

  // useEffect(() => {
  //   // don't show banner in user/plans page
  //   if (pathname === '/user/plans' || Cookie.fromDocument('hide_banner')) {
  //     setShowBanner(false);
  //   } else {
  //     setShowBanner(true);
  //   }
  // }, [pathname]);

  // only show banner in these situations
  // 1. in free trial period
  // 2. 3 days until next auto payment

  if (!me.data || !showBanner) {
    return null;
  }

  if (sub?.is_freetrial && sub?.is_effective) {
    return (
      <div id="banner" className="py-2 w-full bg-gray-100">
        <Container className="flex gap-8 justify-between items-center">
          <p className="text-sm font-light text-gray-900 dark:text-gray-400">
            Bản dùng thử của bạn sẽ kết thúc vào ngày{' '}
            {DateUtil.getDay(sub.end_date)}
          </p>

          <Link href="/user/plans" data-collapse-toggle="banner">
            <Button type="solid" size="small">
              Gia hạn ngay
            </Button>
          </Link>
        </Container>
      </div>
    );
  }

  if (expireIn3Days) {
    return (
      <div id="banner" className="py-2 w-full bg-gray-100">
        <Container className="flex gap-8 justify-between items-center">
          <p className="text-sm font-light text-gray-900 dark:text-gray-400">
            Gói đăng ký của bạn sẽ được gia hạn vào ngày{' '}
            {DateUtil.getDay(sub.end_date)}
          </p>

          <Link href="/user/plans" data-collapse-toggle="banner">
            <Button type="solid" size="small">
              Chi tiết
            </Button>
          </Link>
        </Container>
      </div>
    );
  }
}
