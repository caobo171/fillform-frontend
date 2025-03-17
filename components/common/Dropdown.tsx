import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

type OptionProps = {
  value: string | number | boolean;
  label: string | React.ReactNode;
  href?: string;
  className?: string;
  disableHoverEffect?: boolean;
  onClick?: (value: string) => void;
};

export type DropdownProps = {
  options: OptionProps[];
  buttonClassName?: string;
  buttonText?: string;
  onClickItem?: (value: string) => void;
  popupClassName?: string;
  children?: React.ReactNode;
  className?: string;
};

export function Dropdown(props: DropdownProps) {
  const {
    options,
    buttonText,
    buttonClassName,
    onClickItem,
    popupClassName,
    className,
    children,
  } = props;

  return (
    <Menu
      as="div"
      className={twMerge('relative inline-block text-left', className)}
    >
      {children ? (
        <Menu.Button>{children}</Menu.Button>
      ) : (
        <Menu.Button
          className={twMerge(
            'inline-flex gap-2 w-full justify-center rounded-md bg-white ring-1 ring-gray-300 pl-3 pr-2.5 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 focus:outline-none',
            buttonClassName
          )}
        >
          {buttonText}
          <ChevronDownIcon className="h-5 w-5 " aria-hidden="true" />
        </Menu.Button>
      )}
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={twMerge(
            'absolute right-0 z-2 mt-2 min-w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none',
            popupClassName
          )}
        >
          <div className="px-1 py-1 ">
            {options.map((item) => (
              <Menu.Item key={String(item.value)}>
                {({ active }) =>
                  item?.href ? (
                    <Link
                      href={item.href}
                      className={twMerge(
                        `${
                          active && !item.disableHoverEffect
                            ? 'bg-gray-100'
                            : 'bg-white'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`,
                        item?.className
                      )}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      className={twMerge(
                        `${
                          active && !item.disableHoverEffect
                            ? 'bg-gray-100'
                            : 'bg-white'
                        } group flex w-full items-center rounded-md px-2 py-2 text-sm text-gray-900`,
                        item?.className
                      )}
                      onClick={() => {
                        if (item.onClick) {
                          item.onClick(String(item.value));
                        } else if (onClickItem) {
                          onClickItem(String(item.value));
                        }
                      }}
                    >
                      {item.label}
                    </button>
                  )
                }
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
