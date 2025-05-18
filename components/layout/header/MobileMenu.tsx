import { Dialog, DialogPanel } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import React, { useMemo } from 'react';

import { MenuItemProps, MenuProps } from '@/components/layout/header/Menu';
import Avatar from '@/components/ui/Avatar';
import ACL from '@/services/ACL';
import { Helper } from '@/services/Helper';
import { MeFunctions } from '@/store/me/functions';
import { RawUser } from '@/store/types';

function NavLink({
  data,
  onClose,
}: {
  data: MenuItemProps;
  onClose: (value?: boolean) => void;
}) {
  return (
    <Link
      key={data.href}
      href={data.href}
      onClick={() => onClose()}
      className="text-sm text-gray-900 rounded-md hover:text-primary"
    >
      {data.name}
    </Link>
  );
}

type MobilePanelProps = {
  open?: boolean;
  onClose: (value?: boolean) => void;
  user?: RawUser;
  menu: MenuProps;
};

export function MobileMenu({ open, onClose, user, menu }: MobilePanelProps) {
  const menuItems = useMemo(() => {
    let items: MenuItemProps[] = [];

    if (Array.isArray(menu?.main)) {
      items = [...items, ...menu.main];
    }

    if (Array.isArray(menu?.subs)) {
      items = [...items, ...menu.subs];
    }

    return items;
  }, [menu]);

  const moreItems = useMemo(() => {
    const items = [
      {name: 'Affiliate', href: '/affiliate'}
    ];

    if (ACL.isAdmin(user)) {
      items.push({ name: 'Admin', href: '/admin' });
    }


    return items;
  }, [user]);

  const inOutItems = useMemo(
    () => [
      { name: 'Register', href: '/authentication/register' },
      {
        name: 'Login',
        href: '/authentication/login',
      },
    ],
    []
  );

  return (
    <Dialog as="div" className="semi-lg:hidden" open={open} onClose={onClose}>
      <div className="fixed inset-0 z-200" />
      <DialogPanel className="fixed inset-y-0 right-0 z-30 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
        <div className="flex flex-col gap-4 items-center">
          <div className="w-full flex items-center justify-between">
            {user ? (
              <Link
                href={`/`}
                className="flex gap-4 cursor-pointer"
              >
                <Avatar user={user} unlink size={40} />
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-900">{user.username}</span>
                  <span className="text-xs text-gray-500">
                    {user?.username}
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/" className="outline-none">
                <span className="sr-only">Wele Learn</span>
                <img className="h-8 w-auto" src="/static/logo-color-long.png" alt="logo" />
              </Link>
            )}

            <button
              type="button"
              className="-m-2.5 rounded-md p-2.5 text-gray-700"
              onClick={() => onClose()}
            >
              <span className="sr-only">Close menu</span>
              <XMarkIcon
                className="h-6 w-6 text-gray-500 hover:text-gray-900"
                aria-hidden="true"
              />
            </button>
          </div>

          <div
            className="h-[1px] bg-gray-200"
            style={{ width: 'calc(100% + 48px)' }}
          />

          <div className="w-full flex flex-col gap-2 justify-start items-start">
            {menuItems?.map((item) => (
              <NavLink key={item.href} data={item} onClose={onClose} />
            ))}
          </div>

          {user ? (
            // logged in user
            <>
              <div
                className="h-[1px] bg-gray-200"
                style={{ width: 'calc(100% + 48px)' }}
              />

              <div className="w-full flex flex-col gap-2 justify-start items-start">
                {moreItems?.map((item) => (
                  <NavLink key={item.href} data={item} onClose={onClose} />
                ))}
              </div>

              <div
                className="h-[1px] bg-gray-200"
                style={{ width: 'calc(100% + 48px)' }}
              />

              <div className="w-full">
                <span
                  aria-hidden="true"
                  className="text-sm text-gray-900 hover:text-primary cursor-pointer"
                  onClick={() => {
                    MeFunctions.logout();
                    onClose();
                  }}
                >
                  Logout
                </span>
              </div>
            </>
          ) : (
            // not logged in user
            <>
              <div
                className="h-[1px] bg-gray-200"
                style={{ width: 'calc(100% + 48px)' }}
              />

              <div className="w-full flex flex-col gap-2 justify-start items-start">
                {inOutItems?.map((item) => (
                  <NavLink key={item.href} data={item} onClose={onClose} />
                ))}
              </div>
            </>
          )}
        </div>
      </DialogPanel>
    </Dialog>
  );
}
