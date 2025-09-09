'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { useMyForms } from '@/hooks/form'
import { useMyOrders } from '@/hooks/order'
import { useMe, useUserProfile } from '@/hooks/user'
import { ORDER_STATUS, OPTIONS_DELAY, Code } from '@/core/Constants'
import { useParams, useRouter } from 'next/navigation';
import { Toast } from '@/services/Toast'
import { toast } from 'react-toastify'
import Fetch from '@/lib/core/fetch/Fetch'
import useSWRMutation from 'swr/mutation'
import { FormItem } from '@/components/form/FormItem'
import { TextArea, Input, Modal } from '@/components/common'
import { AnyObject } from '@/store/interface'
import OrderLists from '@/app/(inapp)/_sections/OrderLists'
import FormLists from '@/app/(inapp)/_sections/FormLists'
import DataOrderLists from '@/app/(inapp)/data/builder/_sections/DataOrderLists'
import DataModelLists from '@/app/(inapp)/data/builder/_sections/DataModelLists'
const ITEMS_PER_PAGE = 10;

export default function UserDetailPage() {

    const params = useParams();
    const [openModal, setOpenModal] = useState(false);
    const user = useUserProfile(params.id as string);
    const router = useRouter()

    const { trigger: addCredit, isMutating: addingCredit } = useSWRMutation(
        '/api/user/add.credit',
        Fetch.postFetcher.bind(Fetch)
    );


    const coinInputRef = useRef<HTMLInputElement>(null);
    const contentRef = useRef<HTMLTextAreaElement>(null);

    const handleAddCredit = useCallback(async () => {
        const credit = Number(coinInputRef.current?.value);

        if (!credit) {
            toast.error('Number of credit must be a number');

            return;
        }

        const res: AnyObject = await addCredit({
            payload: {
                user_id: user?.data?.id,
                credit: Number(coinInputRef.current?.value),
                message: contentRef.current?.value,
            },
        });

        if (res?.data?.code === Code.SUCCESS) {
            Toast.success(res?.data?.message);
            user.mutate();
            setOpenModal(false);
        } else {
            Toast.error(res?.data?.message);
        }
    }, [addCredit, user]);

    return (
        <>
            <Modal
                open={openModal}
                onCancel={() => setOpenModal(false)}
                title={`Add credit for ${user?.data?.username}`}
                okText="Add"
                onOk={handleAddCredit}
                okButtonProps={{ loading: addingCredit }}
            >
                <div className="pt-6 pb-4 text-sm text-gray-900">
                    <FormItem
                        label="Number of coins will be added/subtracted"
                        className="mb-5"
                    >
                        <Input type="number" ref={coinInputRef} />
                    </FormItem>

                    <FormItem label="Message">
                        <TextArea ref={contentRef} />
                    </FormItem>
                </div>
            </Modal>
            <section className="py-8 px-4">
                <div className="container mx-auto space-y-8">
                    {/* User Info */}
                    <div className="px-4 sm:px-6 lg:px-8">
                        <h5 className="text-lg font-medium">Xin chào</h5>
                        <h1 className="text-4xl font-bold">{user?.data?.username}</h1>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                            <h4 className="text-2xl"><span className="font-bold">Email: </span>{user?.data?.email}</h4>
                            <h4 className="text-2xl"><span className="font-bold">Số dư: </span>{user?.data?.credit.toLocaleString()} VND</h4>
                        </div>
                        <button
                            onClick={() => setOpenModal(true)}
                            className="mt-4 w-full block text-center py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                        >
                            <h5>Thêm credit</h5>
                        </button>
                    </div>

                    {/* Forms Table */}
                    <FormLists admin={true} />
                    <OrderLists admin={true} />

                    <DataModelLists admin={true} />
                    <DataOrderLists admin={true} />


                </div>
            </section>
        </>

    )
}