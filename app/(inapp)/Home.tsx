'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyForms } from '@/hooks/form'
import { useMyOrders } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import { ORDER_STATUS, OPTIONS_DELAY } from '@/core/Constants'
import { useRouter } from 'next/navigation';
import FormLists from './_sections/FormLists'
import OrderLists from './_sections/OrderLists'
const ITEMS_PER_PAGE = 10;

export default function HomePage() {


    const me = useMe();
    const router = useRouter()

    // Pagination calculations


    const handleNavigate = (path: string) => {
        router.push(path)
    }

    return (
        <section className="py-8 px-4">
            <div className="container mx-auto space-y-8">
                {/* User Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h5 className="text-lg font-medium">Xin chào</h5>
                    <h1 className="text-4xl font-bold">{me?.data?.username}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <h4 className="text-2xl"><span className="font-bold">Email: </span>{me?.data?.email}</h4>
                        <h4 className="text-2xl"><span className="font-bold">Số dư: </span>{me?.data?.credit.toLocaleString()} VND</h4>
                    </div>
                    <button     
                        onClick={() => handleNavigate('/form/create')}
                        className="mt-4 w-full block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <h5>BẮT ĐẦU NGAY</h5>
                    </button>
                </div>

                {/* Forms Table */}
                <FormLists />


                {/* Orders Table */}
                <OrderLists />
            </div>
        </section>
    )
}