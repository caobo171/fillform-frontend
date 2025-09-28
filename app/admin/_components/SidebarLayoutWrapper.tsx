'use client';

import {
  ChartBarIcon,
  CreditCardIcon,
  SpeakerWaveIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { PropsWithChildren, useMemo } from 'react';

import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import { useMe } from '@/hooks/user';
import { FormInputIcon, ListOrderedIcon } from 'lucide-react';

export function SidebarLayoutWrapper({ children }: PropsWithChildren) {
  const me = useMe();

  const sections = useMemo(() => {
    const defaultSections = [
      {
        id: 'main',
        name: '',
        options: [
          { name: 'Users', icon: UserIcon, href: '/admin/users' },
          { name: 'Orders', icon: ListOrderedIcon, href: '/admin/orders' },
          { name: 'Data Orders', icon: ListOrderedIcon, href: '/admin/data.orders' },
          { name: 'Forms', icon: FormInputIcon, href: '/admin/forms' },
          { name: 'Annoucements', icon: SpeakerWaveIcon, href: '/admin/system.announcements' },
          { name: 'Affiliate Withdrawals', icon: CreditCardIcon, href: '/admin/affiliate/withdrawals' },
          { name: 'Affiliate Leaderboard', icon: ChartBarIcon, href: '/admin/affiliate' },
        ],
      },

    ];

    return defaultSections;
  }, [me.data]);

  return <SidebarLayout sections={sections}>{children}</SidebarLayout>;
}
