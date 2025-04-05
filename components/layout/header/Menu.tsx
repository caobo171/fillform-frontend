import { ChevronDownIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useCallback, useMemo } from 'react';

import { Dropdown, PremiumIcon } from '@/components/common';
import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';
import { useMe } from '@/hooks/user';

export type MenuItemProps = {
  name: string;
  href: string;
  isPremium?: boolean;
};

export type MenuProps = {
  main?: MenuItemProps[] | null;
  subs?: MenuItemProps[] | null;
};

export function Menu({ main, subs }: MenuProps) {
  const pathName = usePathname();

  const me = useMe();

  const logClick = useCallback(
    (menuItem: MenuItemProps) => {
      LogEvent.sendEvent('click', {
        type: 'menu-item',
        user: me?.data?.id,
        name: menuItem.name,
        href: menuItem.href,
      });
    },
    [me?.data]
  );

  const mainMenu = useMemo(() => {
    if (!Array.isArray(main)) {
      return null;
    }

    return main.map((item: MenuItemProps) => (
      <Link
        key={item.name}
        href={item.href}
        className={clsx(
          'text-sm text-gray-900 hover:text-primary',
          pathName === item.href ? 'text-primary' : ''
        )}
        onClick={() => logClick(item)}
      >
        {item.isPremium ? (
          <span className="inline-flex gap-2 items-center">
            {item.name} <PremiumIcon />
          </span>
        ) : (
          item.name
        )}
      </Link>
    ));
  }, [logClick, main, pathName]);

  const subMenu = useMemo(() => {
    if (!Array.isArray(subs) || subs.length === 0) {
      return null;
    }

    const list = subs.map((item) => ({
      label: item.isPremium ? (
        <span className="inline-flex gap-2 items-center">
          {item.name} <PremiumIcon />
        </span>
      ) : (
        item.name
      ),
      href: item.href,
      value: item.href,
      onclick: () => logClick(item),
    }));

    return (
      <Dropdown options={list} className="" popupClassName="top-[36px]">
        <div
          aria-hidden="true"
          className="group flex items-center gap-1"
          onClick={() => logClick({ name: 'More', href: '' })}
        >
          <span className="text-sm text-gray-900">More</span>
          <ChevronDownIcon className="w-5 h-5 text-gray-500 group-hover:text-gray-900" />
        </div>
      </Dropdown>
    );
  }, [logClick, subs]);

  return (
    <div className="flex items-center gap-x-10">
      {mainMenu}
      {subMenu}
    </div>
  );
}
