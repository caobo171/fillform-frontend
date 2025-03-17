'use client';

import clsx from 'clsx';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Container } from '../container/container';

const navigation = {
  detail: [
    { name: 'Về chúng mình', href: '/#about' },
    {
      name: 'Tính năng',
      href: '/#features',
    },
    {
      name: 'Bảng giá',
      href: '/#pricing',
    },
  ],
  social: [
    {
      name: 'Zalo',
      href: 'https://zalo.me/g/rxkjpk038',
      icon: '/static/svg/zalo.svg',
    },
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/groups/464396007027802',
      icon: '/static/svg/facebook.svg',
    },
    {
      name: 'Youtube',
      href: 'https://www.youtube.com/channel/UC-bVLpxpdo1GWQGvbQ5QXqA',
      icon: '/static/svg/youtube.svg',
    },
    {
      name: 'Discord',
      href: 'https://discord.com/channels/1189814075539067011/1190324247978061959',
      icon: '/static/svg/discord.svg',
    },
  ],
  contacts: [{ name: 'Contact us', href: 'https://www.facebook.com/welevn' }],
};

export function LayoutFooter() {
  const pathName = usePathname();

  return (
    <footer
      aria-labelledby="footer-heading"
      className={clsx('bg-gray-100', { 'mt-10': pathName !== '/' })}
    >
      <Container>
        <div className="pt-20 pb-12 flex flex-col gap-8 md:flex-row">
          <div className="flex-1">
            <a href="/">
              <img
                className="h-12 mb-4"
                src="/static/logo.png"
                alt="Company name"
              />
            </a>

            <p className="text-sm text-gray-500 mb-10">
              Nghe chép chính tả - Lan toả niềm vui
            </p>

            <div className="flex gap-x-4">
              <a
                href="https://play.google.com/store/apps/details?id=com.welelearnapp"
                target="_blank"
              >
                <img
                  src="/static/google-play.png"
                  alt="google play"
                  className="h-10 w-auto"
                />
              </a>

              <a
                href="https://apps.apple.com/vn/app/wele-learn/id6449467539"
                target="_blank"
              >
                <img
                  src="/static/app-store.png"
                  alt="apple store"
                  className="h-10 w-auto"
                />
              </a>
            </div>
          </div>

          <div className="md:w-1/2 flex">
            <div className="flex flex-col gap-y-4 text-sm text-gray-900 mr-10 md:mr-32">
              <p className="font-bold">Thông tin</p>

              {navigation.detail.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:text-gray-500"
                >
                  {item.name}
                </Link>
              ))}

              <a
                href="https://www.facebook.com/groups/464396007027802"
                target="_blank"
                className="hover:text-gray-500"
              >
                Liên hệ
              </a>
            </div>

            <div className="flex flex-col gap-y-4 text-sm text-gray-900">
              <p className="font-bold">Mạng xã hội</p>

              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  target="_blank"
                  className="flex gap-x-2 items-center hover:text-gray-500"
                >
                  <img src={item.icon} alt={item.name} /> {item.name}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 py-6 border-t border-solid border-gray-100">
          © Copyright {new Date().getFullYear()} - WELE
        </div>
      </Container>
    </footer>
  );
}
