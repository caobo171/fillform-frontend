'use client';

import {
  UserIcon,
} from '@heroicons/react/24/outline';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import { useMe } from '@/hooks/user';

export function SidebarLayoutWrapper({ children }: PropsWithChildren) {
  const me = useMe();

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
  }, [me.data]);

  return <SidebarLayout sections={sections}>{children}</SidebarLayout>;
}
