'use client';

import { Bars3CenterLeftIcon } from '@heroicons/react/24/outline';
import { useWindowScroll } from '@uidotdev/usehooks';
import clsx from 'clsx';
import { useMemo } from 'react';
import { twMerge } from 'tailwind-merge';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import { Dropdown } from '@/components/common';
import { Container } from '@/components/layout/container/container';
import { UserMenu } from '@/components/layout/header/UserMenu';
import { Helper } from '@/services/Helper';
import { MeHook } from '@/store/me/hooks';

function LinkItem({
  href,
  children,
  target
}: {
  href: string;
  children: React.ReactNode;
  target?: string;
}) {
  return (
    <a
      href={href}
      target={target === '_blank' ? '_blank' : undefined}
      className="transition-all text-base text-gray-900 hover:text-primary"
    >
      {children}
    </a>
  );
}

export function TopNav() {
  const [{ x, y }] = useWindowScroll();

  const me = MeHook.useMe();

  const subscription = MeHook.useSubscription();

  const isPremium = useMemo(
    () => Helper.isPremiumUser(subscription),
    [subscription]
  );

  return (
    <nav
      className={clsx(
        'fixed top-0 left-0 z-50 bg-transparent w-full py-4',
        'transition duration-200 ease-in-out',
        {
          'bg-white': y !== null && y > 80,
        }
      )}
    >
      <Container
        className={twMerge('flex items-center justify-between gap-20')}
      >
        <img src="/static/logo.svg" alt="logo" className="h-12 w-auto" />

        <div
          className={clsx('hidden items-center gap-10 lg:flex', {
            'flex-1': !me,
          })}
        >
          <LinkItem href="/#about">Về chúng mình</LinkItem>
          <LinkItem href="/#features">Tính năng</LinkItem>
          <LinkItem href="/#faq">Câu hỏi thường gặp</LinkItem>
          <LinkItem href="https://blog.wele-learn.com" target='_blank'>Blog</LinkItem>
        </div>

        {/* mobile */}
        <div className="scale-[1.2] lg:hidden">
          <Dropdown
            options={[
              {
                label: (
                  <a href="/#about" className="block px-2 py-2">
                    Về chúng mình
                  </a>
                ),
                value: 'about',
                className: 'block py-0 px-0 text-left',
              },
              {
                label: (
                  <a href="/#features" className="block px-2 py-2">
                    Tính năng
                  </a>
                ),
                value: 'features',
                className: 'block py-0 px-0 text-left',
              },
              {
                label: (
                  <a href="/#faq" className="block px-2 py-2">
                    Câu hỏi thường gặp
                  </a>
                ),
                value: 'faq',
                className: 'block py-0 px-0 text-left',
              },
              {
                label: (
                  <a href="https://blog.wele-learn.com/" className="block px-2 py-2">
                    Blogs
                  </a>
                ),
                value: 'blogs',
                className: 'block py-0 px-0 text-left',
              },
            ]}
          >
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-red-50">
              <Bars3CenterLeftIcon className="w-5 h-5" />
            </div>
          </Dropdown>
        </div>

        {/* desktop */}
        {me ? (
          <div className="hidden items-center gap-4 scale-[1.2] lg:flex">
            <UserMenu data={me} isPremium={isPremium} />
          </div>
        ) : (
          <div className="hidden items-center gap-4 lg:flex">
            <a href="https://app.wele-learn.com/authentication/login">
              <ButtonGradient type="text">Đăng nhập</ButtonGradient>
            </a>

            <a href="https://app.wele-learn.com/authentication/register">
              <ButtonGradient type="solid">Bắt đầu miễn phí</ButtonGradient>
            </a>
          </div>
        )}
      </Container>
    </nav>
  );
}
