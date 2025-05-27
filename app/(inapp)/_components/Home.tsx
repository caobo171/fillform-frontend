'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMyForms } from '@/hooks/form'
import { useMyOrders } from '@/hooks/order'
import { useMe } from '@/hooks/user'
import { ORDER_STATUS, OPTIONS_DELAY } from '@/core/Constants'
import { useRouter } from 'next/navigation';
import FormLists from '../_sections/FormLists'
import OrderLists from '../_sections/OrderLists'
const ITEMS_PER_PAGE = 10;

export default function HomePage() {


    const me = useMe();
    const router = useRouter()

    // Pagination calculations


    const handleNavigate = (path: string) => {
        router.push(path)
    }

    return (
        <section className="bg-gradient-to-b from-primary-50 to-white py-8 px-4">
            <div className="container mx-auto space-y-8" data-aos="fade-up">
                {/* User Info */}
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
                    <h5 className="text-lg font-medium">Xin chào</h5>
                    <h1 className="text-4xl font-bold">{me?.data?.username}</h1>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        <h4 className="text-2xl"><span className="font-bold">Email: </span>{me?.data?.email}</h4>
                        <h4 className="text-2xl"><span className="font-bold">Số dư: </span>{me?.data?.credit.toLocaleString()} VND</h4>
                    </div>
                    <button     
                        onClick={() => handleNavigate('/form/create')}
                        className="mt-4 w-full block text-center py-3 px-4 bg-primary-600 text-white font-bold rounded-md hover:bg-primary-700 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
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