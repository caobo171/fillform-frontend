import { Disclosure } from '@headlessui/react';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { twMerge } from 'tailwind-merge';

type AccordionItemObject = {
  title: string | React.ReactNode;
  content: string | React.ReactNode;
};

export type AccordionProps = {
  title?: string;
  items: AccordionItemObject[];
  className?: string;
};

export function Accordion(props: AccordionProps) {
  const { title, items, className } = props;

  return (
    <div className={twMerge('divide-y divide-gray-900/10', className)}>
      {title && (
        <h2 className="text-2xl font-medium leading-10 tracking-tight text-gray-900">
          {title}
        </h2>
      )}

      <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
        {items.map((item) => (
          <Disclosure as="div" key={String(item.title)} className="pt-6">
            {({ open }) => (
              <>
                <dt>
                  <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
                    <span className="text-base font-medium leading-7 text-gray-900">
                      {item.title}
                    </span>
                    <span className="ml-6 flex h-7 items-center">
                      {open ? (
                        <MinusIcon
                          className="h-6 w-6 text-gray-900"
                          aria-hidden="true"
                        />
                      ) : (
                        <PlusIcon
                          className="h-6 w-6 text-gray-900"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </Disclosure.Button>
                </dt>
                <Disclosure.Panel as="dd" className="mt-2 pr-12">
                  <p className="text-sm leading-7 text-gray-600">
                    {item.content}
                  </p>
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </dl>
    </div>
  );
}
