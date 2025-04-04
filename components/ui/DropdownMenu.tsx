import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';
import Link from 'next/link';
import { Fragment } from 'react';

type Props = {
  options: {
    name: string;
    href?: string;
    onClick?: () => void;
  }[];
  children: React.ReactNode;
  className?: string;
};

export const DropdownMenu = (props: Props) => {
  return (
    <Menu as="div" className="relative">
      <div>
        <Menu.Button className="relative flex rounded focus:outline-non">
          {props.children}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {props.options.map((item) => (
            <Menu.Item key={item.name}>
              {({ active }) => (
                <Link
                  href={item.href || ''}
                  onClick={item.onClick}
                  className={clsx(
                    active ? 'bg-gray-100' : '',
                    'block px-4 py-2 text-sm text-gray-700'
                  )}
                >
                  {item.name}
                </Link>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
