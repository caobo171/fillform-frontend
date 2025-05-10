import {
  ArrowRightStartOnRectangleIcon,
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';
import React, { useMemo } from 'react';

import { Dropdown, DropdownProps, PremiumIcon } from '@/components/common';
import Avatar from '@/components/ui/Avatar';
import ACL from '@/services/ACL';
import { Helper } from '@/services/Helper';
import { MeFunctions } from '@/store/me/functions';
import { RawUser } from '@/store/types';

type UserMenuProps = {
  data: RawUser;
};

export function UserMenu({ data }: UserMenuProps) {
  const dropdownItemCls = 'flex gap-4 items-center px-2 h-7';
  const opts = useMemo(() => {
    const options: DropdownProps['options'] = [
      {
        label: (
          <div className="flex gap-4">
            <Avatar user={data} unlink size={40} />
            <div className="flex flex-col gap-1">
              <span>{data?.username}</span>
              <span className="text-xs text-gray-500">{data?.username}</span>
            </div>
          </div>
        ),
        value: 'profile',
        className: '',
        href: `/`,
      },
    ];


    if (ACL.isAdmin(data)) {
      options.push({
        label: (
          <div className={dropdownItemCls}>
            <WrenchScrewdriverIcon className="w-5 h-5" /> Admin
          </div>
        ),
        value: 'admin',
        href: '/admin',
      });
    }



    options.push({
      label: (
        <div className={dropdownItemCls}>
          <CurrencyDollarIcon className="w-5 h-5" /> Affiliate
        </div>
      ),
      value: 'affiliate',
      href: '/affiliate',
    });



    options.push({
      label: (
        <div className={dropdownItemCls}>
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" /> Đăng xuất
        </div>
      ),
      value: 'logout',
    });

    return options;
  }, [data]);

  const handleItemClick = (val: string | number | boolean) => {
    if (val === 'logout') {
      MeFunctions.logout();
    }
  };

  return (
    <Dropdown
      options={opts}
      onClickItem={handleItemClick}
      popupClassName="max-w-70"
      className="h-10"
    >
      <div className="relative flex-row items-center gap-2 flex">

        <Avatar user={data} unlink />
        <div className="font-medium">{data?.username}</div>
      </div>
    </Dropdown>
  );
}
