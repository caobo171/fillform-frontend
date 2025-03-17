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
          { name: 'Podcasts', icon: MicrophoneIcon, href: '/admin' },
          {
            name: 'Classes',
            icon: ChatBubbleOvalLeftEllipsisIcon,
            href: '/admin/classes',
          },
          {
            name: 'Challenges',
            icon: RocketLaunchIcon,
            href: '/admin/challenges',
          },
        ],
      },
      {
        id: 'subscription',
        name: 'Subscription',
        options: [
          {
            name: 'Subscription',
            icon: CreditCardIcon,
            href: '/admin/subscription',
          },
          {
            name: 'Subscriptions order',
            icon: ArrowPathRoundedSquareIcon,
            href: '/admin/subscription/orders',
          },
        ],
      },

      {
        id: 'settings',
        name: 'Settings',
        options: [
          {
            name: 'Tasks',
            icon: RectangleStackIcon,
            href: '/admin/task',
          },
          {
            name: 'Collections',
            icon: Square2StackIcon,
            href: '/admin/collections',
          },
          { name: 'Sources', icon: CircleStackIcon, href: '/admin/sources' },
          { name: 'Users', icon: UserIcon, href: '/admin/users' },
          {
            name: 'Certifications',
            icon: CheckBadgeIcon,
            href: '/admin/certifications',
          },
          {
            name: 'Notifications',
            icon: BellIcon,
            href: '/admin/notifications',
          },
        ],
      },
    ];

    if (ACL.isSuperAdmin(me)) {
      defaultSections.push({
        id: 'super_admin',
        name: '',
        options: [
          {
            name: 'Super Admin Classes',
            icon: ChatBubbleOvalLeftEllipsisIcon,
            href: '/admin/classes?is_super_admin=true',
          },
        ],
      });
    }

    return defaultSections;
  }, [me]);

  return <SidebarLayout sections={sections}>{children}</SidebarLayout>;
}
