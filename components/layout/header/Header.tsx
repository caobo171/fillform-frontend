'use client';

import { Bars3Icon } from '@heroicons/react/24/outline';
import { useWindowScroll } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { usePathname } from 'next/navigation';
import React, { useMemo, useState } from 'react';

import { InOutButtons } from '@/components/layout/header/InOutButtons';
import { Logo } from '@/components/layout/header/Logo';
import { Menu, MenuProps } from '@/components/layout/header/Menu';
import { MobileMenu } from '@/components/layout/header/MobileMenu';
import { NotificationButton } from '@/components/layout/header/NotificationButton';
import { NotificationContextProvider } from '@/components/layout/header/NotificationContext';
import { UserMenu } from '@/components/layout/header/UserMenu';
import { useMe } from '@/hooks/user';
import { Helper } from '@/services/Helper';
import { MeHook } from '@/store/me/hooks';

type HeaderProps = {
  menu: MenuProps;
  searchUrl?: string;
  children?: React.ReactNode;
};

export function Header({ menu, searchUrl, children }: HeaderProps) {
  const { data, error, isLoading } = useMe();

  const [openMobileMenu, setOpenMobileMenu] = useState<boolean>(false);

  const [{ y }] = useWindowScroll();

  const pathName = usePathname();

  const isAdminPage =
    pathName.includes('admin') ||
    pathName.includes('content-creator') ||
    pathName.includes('teacher');

  const isLandingPage = pathName === '/';

  const rightBlock = useMemo(() => {
    if (isLoading) {
      return (
        <>
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
          <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
        </>
      );
    }

    if (!data || error) {
      return <InOutButtons />;
    }

    return (
      <>

        <UserMenu data={data} />
      </>
    );
  }, [isLoading, data, error]);

  return (
    <NotificationContextProvider>
      {/* Desktop UI */}
      <header
        className={clsx(
          'hidden semi-lg:block py-2 top-0 left-0 z-20 w-full fixed',
          {
            'shadow-bottom shadow-gray-200': !isLandingPage,
            'bg-white': Number(y) > 56 || !isLandingPage,
          }
        )}
      >
        <nav
          className={clsx('mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8', {
            'container': !isAdminPage,
          })}
        >
          <div className="flex items-center gap-x-20">
            <Logo />
          </div>

          <Menu subs={menu?.subs} main={menu?.main} />


          <div className="flex items-center gap-4">
            {children}
            {rightBlock}
          </div>
        </nav>
      </header>

      {/* Mobile UI */}
      <header
        className={clsx('semi-lg:hidden py-2 top-0 left-0 z-20 w-full fixed', {
          'shadow-bottom shadow-gray-200': !isLandingPage,
          'bg-white': Number(y) > 56 || !isLandingPage,
        })}
      >
        <nav
          className={clsx('mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8', {
            'container': !isAdminPage,
          })}
        >
          <Logo />

          <div className="h-10 w-10 flex items-center justify-center">
            <Bars3Icon
              className="w-6 h-6 text-gray-500 cursor-pointer"
              onClick={() => setOpenMobileMenu(true)}
            />
          </div>
        </nav>

        {/* check error to refresh data in case click logout button */}
        <MobileMenu
          user={!data || error ? undefined : data}
          onClose={() => setOpenMobileMenu(false)}
          menu={menu}
          open={openMobileMenu}
        />
      </header>
    </NotificationContextProvider>
  );
}
