'use client'
import { Fragment, useState } from 'react'
import { Dialog, Disclosure, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon, PlusIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { Container } from '../container/container'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { FaCheckCircle, FaCheckSquare, FaRegCircle, FaRegSquare } from 'react-icons/fa'
import { Helper } from '@/services/Helper'
import { PremiumIcon } from '@/components/common'

type OptType = {
    value: string | number,
    label: string,
    default?: boolean,
    premium?: boolean
}

export type SectionOpt = {
    name: string,
    id: string,
    mode?: string,
    options: OptType[]
}

export default function FilterLayout(
    props: {
        children: React.ReactNode,
        filter_path?: string,
        filters: SectionOpt[]
    }
) {
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

    const search_params = useSearchParams();
    const router = useRouter();

    const filter_path = props.filter_path || 'podcasts';

    const handleCheck = (key: string, value: string | number) => {
        const values = search_params.get(key)?.split('_') || []

        // TODO: Refactor this to use Helper.getUrlQuery
        return router.push(filter_path + Helper.getUrlQuery({
            [key]: values.includes(value.toString()) ? values.filter(e => e != value.toString()).join('_') : values.concat(value.toString()).join('_'),
            page: 1,
        }));
    }


    const handleCheckRadio = (key: string, value: string | number) => {

        // TODO: Refactor this to use Helper.getUrlQuery
        return router.push(filter_path + Helper.getUrlQuery({
            [key]: value,
            page: 1,
        }));
    }

    const getOption = (section: SectionOpt, option: OptType) => {
        const active = search_params.get(section.id) ?
            search_params.get(section.id)?.split('_').includes(option.value.toString()) :
            option.default

        if (section.mode == 'checkbox') {
            return <div onClick={() => handleCheckRadio(section.id, option.value)} key={option.value} className="flex items-center cursor-pointer">
                {active ? <span className="mr-2 text-primary"> <FaCheckCircle /> </span>
                    : <span className="mr-2"> <FaRegCircle /> </span>}
                <label
                    className="ml-3 text-sm text-gray-500"
                >
                    {option.label}
                </label>
                {option.premium ? <PremiumIcon /> : ''}
            </div>
        }

        if (section.mode == 'radio') {
            return <div onClick={() => handleCheckRadio(section.id, option.value)} key={option.value}
                className={clsx('flex items-center font-medium cursor-pointer py-2 px-2 rounded', active ? 'bg-gray-100 text-primary' : 'text-gray-500')}>
                <label
                    className="mx-3 text-sm"
                >
                    {option.label}
                </label>
                {option.premium ? <PremiumIcon /> : ''}
            </div>
        }

        return (
            <div onClick={() => handleCheck(section.id, option.value)} key={option.value} className="flex items-center cursor-pointer">
                {active ? <span className="mr-2 text-primary"> <FaCheckSquare /> </span>
                    : <span className="mr-2"> <FaRegSquare /> </span>}
                <label
                    className="ml-3 text-sm text-gray-500"
                >
                    {option.label}
                </label>
                {option.premium ? <PremiumIcon /> : ''}
            </div>
        )
    }

    return (
        <div >
            <div>
                {/* Mobile filter dialog */}
                <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                    <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
                        <Transition.Child
                            as={Fragment}
                            enter="transition-opacity ease-linear duration-300"
                            enterFrom="opacity-0"
                            enterTo="opacity-100"
                            leave="transition-opacity ease-linear duration-300"
                            leaveFrom="opacity-100"
                            leaveTo="opacity-0"
                        >
                            <div className="fixed inset-0 bg-black bg-opacity-25" />
                        </Transition.Child>

                        <div className="fixed inset-0 z-40 flex">
                            <Transition.Child
                                as={Fragment}
                                enter="transition ease-in-out duration-300 transform"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transition ease-in-out duration-300 transform"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                                    <div className="flex items-center justify-between px-4">
                                        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
                                        <button
                                            type="button"
                                            className="-mr-2 flex h-10 w-10 items-center justify-center p-2 text-gray-400 hover:text-gray-500"
                                            onClick={() => setMobileFiltersOpen(false)}
                                        >
                                            <span className="sr-only">Close menu</span>
                                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                        </button>
                                    </div>

                                    {/* Filters */}
                                    <form className="mt-4">
                                        {props.filters.map((section) => (
                                            <Disclosure defaultOpen={true} as="div" key={section.name} className="border-t border-gray-200 pb-4 pt-4">
                                                {({ open }) => (
                                                    <fieldset>
                                                        <legend className="w-full px-2">
                                                            <Disclosure.Button className="flex w-full items-center justify-between p-2 text-gray-400 hover:text-gray-500">
                                                                <span className="text-sm font-medium text-gray-900">{section.name}</span>
                                                                <span className="ml-6 flex h-7 items-center">
                                                                    <ChevronDownIcon
                                                                        className={clsx(open ? '-rotate-180' : 'rotate-0', 'h-5 w-5 transform')}
                                                                        aria-hidden="true"
                                                                    />
                                                                </span>
                                                            </Disclosure.Button>
                                                        </legend>
                                                        <Disclosure.Panel className="px-4 pb-2 pt-4">
                                                            <div className="space-y-6">
                                                                {section.options.map((option) => getOption(section, option))}
                                                            </div>
                                                        </Disclosure.Panel>
                                                    </fieldset>
                                                )}
                                            </Disclosure>
                                        ))}
                                    </form>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition.Root>

                <Container>
                    <div className="md:pt-8 lg:grid lg:grid-cols-3 lg:gap-x-8 xl:grid-cols-4">
                        <aside>
                            <h2 className="sr-only">Filters</h2>

                            <button
                                type="button"
                                className="inline-flex items-center lg:hidden"
                                onClick={() => setMobileFiltersOpen(true)}
                            >
                                <span className="text-sm font-medium text-gray-700">Filters</span>
                                <PlusIcon className="ml-1 h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                            </button>

                            <div className="hidden lg:block">
                                <form className="space-y-8 divide-y divide-gray-200">
                                    {props.filters.map((section, sectionIdx) => (
                                        <div key={section.name} className={sectionIdx === 0 ? '' : 'pt-4'}>
                                            <fieldset>
                                                <legend className="block text-sm font-medium text-gray-900">{section.name}</legend>
                                                <div className="space-y-3 pt-4">
                                                    {section.options.map((option) => getOption(section, option))}
                                                </div>
                                            </fieldset>
                                        </div>
                                    ))}
                                </form>
                            </div>
                        </aside>

                        {/* Product grid */}
                        <div className="mt-6 lg:col-span-2 lg:mt-0 xl:col-span-3">
                            {props.children}
                        </div>
                    </div>
                </Container>


            </div>
        </div>
    )
}
