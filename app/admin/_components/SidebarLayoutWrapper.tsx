'use client';

import {
  ArrowPathRoundedSquareIcon,
  BellIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  CheckBadgeIcon,
  CircleStackIcon,
  CreditCardIcon,
  MicrophoneIcon,
  RectangleStackIcon,
  RocketLaunchIcon,
  Square2StackIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import ACL from '@/services/ACL';
import { MeHook } from '@/store/me/hooks';

export function SidebarLayoutWrapper({ children }: PropsWithChildren) {
  const me = MeHook.useMe();

  const sections = useMemo(() => {
    const defaultSections = [
      {
        id: 'main',
        name: '',
        options: [
          { name: 'Users', icon: UserIcon, href: '/admin/users' },
        ],
      },

    ];

    return defaultSections;
  }, [me]);

  return <SidebarLayout sections={sections}>{children}</SidebarLayout>;
}
