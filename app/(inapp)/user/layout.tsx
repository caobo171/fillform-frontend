'use client';

import {
  BellIcon,
  ChartBarSquareIcon,
  CircleStackIcon,
  CreditCardIcon,
  LockClosedIcon,
  RectangleStackIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { usePathname } from 'next/navigation';
import { ReactElement, useMemo } from 'react';

import { SidebarInline } from '@/components/common';
import { Container } from '@/components/layout/container/container';

export default function Layout({ children }: { children: ReactElement }) {
  const pathname = usePathname();

  const sidebarItems = useMemo(
    () =>
      [
        {
          title: 'Thông tin tài khoản',
          icon: UserIcon,
          href: '/user/account',
          active: false,
        },
        {
          title: 'Thay đổi mật khẩu',
          icon: LockClosedIcon,
          href: '/user/change-password',
          active: false,
        },
        {
          title: 'Gói dịch vụ của bạn',
          icon: CreditCardIcon,
          href: '/user/plans',
          active: false,
        },
        {
          title: 'Phân tích thành tựu',
          icon: ChartBarSquareIcon,
          href: '/user/record',
          active: false,
        },
        {
          title: 'Lịch sử biến động coin',
          icon: CircleStackIcon,
          href: '/user/coin-history',
          active: false,
        },
        {
          title: 'Nhiệm vụ kiếm coin',
          icon: RectangleStackIcon,
          href: '/user/task',
          active: false,
        },
        {
          title: 'Thông báo',
          icon: BellIcon,
          href: '/user/notifications',
          active: false,
        },
      ].map((item) => ({ ...item, active: pathname === item.href })),
    [pathname]
  );

  return (
    <div className="bg-gray-50 mb-[-40px] min-h-screen">
      <Container>
        <div className="flex gap-[80px] pt-10 pb-[64px]">
          <SidebarInline
            items={sidebarItems}
            className="w-[220px] flex-shrink-0"
          />
          <div className="flex-1">{children}</div>
        </div>
      </Container>
    </div>
  );
}
