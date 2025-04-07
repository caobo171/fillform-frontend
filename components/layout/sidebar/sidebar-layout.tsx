'use client';

import { Dialog, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import { Fragment, PropsWithChildren, useEffect, useState } from 'react';

type NavigationType = {
  name: string;
  href: string;
  icon: React.ElementType;
  default?: boolean;
  count?: number;
};

type SectionType = { id: string; name: string; options: NavigationType[] };

export function SidebarLayout(
  props: PropsWithChildren<{ sections: SectionType[] }>
) {
  const [selectedHref, setSelectedHref] = useState<string>('');

  useEffect(() => {
    setSelectedHref(window.location.pathname + window.location.search);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  function getSections() {
    return (
      <>
        {props.sections.map((section) => (
          <ul key={section.id} role="list" className="space-y-2">
            {section.options.map((option) => {
              const active = selectedHref == option.href || option.default;

              return (
                <li key={option.name}>
                  <Link
                    href={option.href}
                    className={clsx(
                      active
                        ? 'bg-primary-50 text-primary'
                        : 'text-gray-700 hover:bg-gray-100',
                      'group flex gap-x-2 rounded-md px-2 py-2 text-sm'
                    )}
                    onClick={() => setSelectedHref(option.href)}
                  >
                    <option.icon
                      className={clsx(
                        active ? 'text-primary' : 'text-gray-700',
                        'h-5 w-auto shrink-0'
                      )}
                      aria-hidden="true"
                    />
                    {option.name}
                    {option.count ? (
                      <span
                        className="ml-auto w-9 min-w-max whitespace-nowrap rounded-full bg-white px-2.5 py-0.5 text-center text-xs font-medium leading-5 text-gray-600 ring-1 ring-inset ring-gray-200"
                        aria-hidden="true"
                      >
                        {option.count}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        ))}
      </>
    );
  }

  return (
    <div>
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50 lg:hidden"
          onClose={setSidebarOpen}
        >
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                {/* Sidebar component, swap this element with another sidebar if you like */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 py-4">
                  <nav className="flex flex-1 flex-col">{getSections()}</nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:top-0 lg:left-0 lg:z-10 lg:flex lg:flex-col h-full min-w-[220px]">
        {/* Sidebar component, swap this element with another sidebar if you like */}
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-4 pt-20 pb-6 shadow-right shadow-gray-200">
          <nav className="flex flex-1 flex-col gap-y-6">{getSections()}</nav>
        </div>
      </div>

      <main className="lg:pl-52">
        <div className="mx-auto container pt-20 pb-10 px-4 sm:px-6">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div>{props.children}</div>
        </div>
      </main>
    </div>
  );
}
