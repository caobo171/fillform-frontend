import { Popover as PopoverHeadless, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { twMerge } from 'tailwind-merge';

type PopoverProps = {
  className?: string;
  children: React.ReactNode;
  button?: React.ReactNode;
  popupClassName?: string;
};

export function Popover(props: PopoverProps) {
  const { button, className, popupClassName, children } = props;

  return (
    <PopoverHeadless className={twMerge('relative', className)}>
      <PopoverHeadless.Button className="outline-none">
        {button}
      </PopoverHeadless.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverHeadless.Panel
          className={twMerge(
            'absolute z-10 mt-2 w-[400px] transform',
            'overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 p-3 bg-white',
            popupClassName
          )}
        >
          {children}
        </PopoverHeadless.Panel>
      </Transition>
    </PopoverHeadless>
  );
}
