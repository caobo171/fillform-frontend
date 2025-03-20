'use client'
import {
    ArrowDownCircleIcon,
    ArrowPathIcon,
    ArrowUpCircleIcon,
    CursorArrowRippleIcon,
} from '@heroicons/react/20/solid'
import { MeHook } from '@/store/me/hooks'
import Link from 'next/link'
import FormLists from './_sections/FormList';

export default function Home() {
    const user = MeHook.useMe();

    return (
        <>

            <main>
                <div className="relative isolate overflow-hidden pt-0">
                    {/* Secondary navigation */}
                    <header className="pb-4 pt-6 sm:pb-6">
                        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
                            <div>
                                <h1 className="text-3xl font-semibold text-gray-900">
                                    Xin chào, {user?.username}
                                </h1>
                                <p className="text-sm text-gray-500 pt-2">
                                    Email: {user?.email}
                                </p>
                            </div>

                            <Link
                                href="/form/create"
                                className="ml-auto flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <CursorArrowRippleIcon aria-hidden="true" className="-ml-1.5 size-5" />
                                Bắt đầu ngay
                            </Link>
                        </div>
                    </header>

                    {/* Stats */}
                    <div className="border-b border-b-gray-900/10 lg:border-t lg:border-t-gray-900/5">
                        <dl className="mx-auto grid max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 lg:px-2 xl:px-0">
                            <div
                                className={'flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2 border-t border-gray-900/5 px-4 py-2 sm:px-6 lg:border-t-0 xl:px-8'}
                            >
                                <dt className="text-sm/6 font-medium text-gray-500">{'Số dư tài khoản'}</dt>
                            
                                <dd className="w-full flex-none text-3xl/10 font-medium tracking-tight text-gray-900">
                                    {user?.credit} VNĐ
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <div
                        aria-hidden="true"
                        className="absolute left-0 top-full -z-10 mt-96 origin-top-left translate-y-40 -rotate-90 transform-gpu opacity-20 blur-3xl sm:left-1/2 sm:-ml-96 sm:-mt-10 sm:translate-y-0 sm:rotate-0 sm:transform-gpu sm:opacity-50"
                    >
                        <div
                            style={{
                                clipPath:
                                    'polygon(100% 38.5%, 82.6% 100%, 60.2% 37.7%, 52.4% 32.1%, 47.5% 41.8%, 45.2% 65.6%, 27.5% 23.4%, 0.1% 35.3%, 17.9% 0%, 27.7% 23.4%, 76.2% 2.5%, 74.2% 56%, 100% 38.5%)',
                            }}
                            className="aspect-[1154/678] w-[72.125rem] bg-gradient-to-br from-[#FF80B5] to-[#9089FC]"
                        />
                    </div>
                </div>

                <div className="space-y-16 py-0 xl:space-y-20">
                    {/* Recent activity table */}
                    <div>
                        <div className="overflow-hidden border-t border-gray-100">
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="mx-auto w-full lg:mx-0 lg:max-w-none">
                                    <table className="w-full text-left">
                                        <tbody>
                                            <FormLists />
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </>
    )
}