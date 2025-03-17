'use client'
import Loading from '@/components/loading';
import React, { useCallback, useState } from 'react';
import { useAsync } from 'react-use';
import Fetch from '@/lib/core/fetch/Fetch';
import { Hook } from '@/services/Hook';
import { RawSubscription } from '@/store/types';
import { Helper } from '@/services/Helper';
import { useRouter } from 'next/navigation';
import UIBlock from '@/components/ui/UIBlock';
import Avatar from '@/components/ui/Avatar';
import Paginate from '@/components/paginate/Paginate';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSkeleton, TableTh } from '@/components/ui/Table';
import { useUser } from '@/hooks/user';
import { UserBlockSkeleton } from '@/components/block/UserBlock';
import { UIButton } from '@/components/ui/Button';
import { useSubscriptions } from '@/hooks/subscription';
import { PageHeader } from '@/components/page/PageHeader';
import SearchItem from '@/components/layout/header/SearchItem';
import { IoSearch } from 'react-icons/io5';
import { PencilSquareIcon } from '@heroicons/react/24/outline';
import { SubscriptionModal } from './SubscriptionModal';
import { toast } from 'react-toastify';


const SubscriptionList = () => {
    const search_params = useSearchParams();
    const page = search_params.get('page');
    const page_size = 20


    const { data, isLoading, mutate } = useSubscriptions(search_params, page_size)


    if (isLoading || !data) {
        return <TableSkeleton num={10} cells={[80, null, 100, 160, 160, 100]} />
    }

    return (
        <>
            <PageHeader title='All subscriptions' subtitle='Manage all subscriptions in system'>
                <div className="none semi-xs:flex items-center bg-gray-100 rounded-lg">
                    <label className="pr-2.5 pl-2 py-2" htmlFor="search"><IoSearch /></label>
                    <SearchItem url={"/admin/subscription"} />
                </div>
            </PageHeader>
            <div className='mt-8 flow-root'>
                <Table>
                    <TableHead>
                        <TableTh style={{ width: 80 }}>ID</TableTh>
                        <TableTh>Subscription</TableTh>
                        <TableTh style={{ width: 100 }}>Order</TableTh>
                        <TableTh style={{ width: 160 }}>Bắt đầu</TableTh>
                        <TableTh style={{ width: 160 }}>Kết thúc</TableTh>
                        <TableTh style={{ width: 100 }}></TableTh>
                    </TableHead>
                    <TableBody>
                        {
                            (data.subscriptions as RawSubscription[]).map(e => (
                                <SubscriptionItem key={e.id} subscription={e} mutate={mutate} />
                            ))
                        }

                    </TableBody>
                </Table>
            </div>


            <div className="px-12">
                {data &&
                    //@ts-ignore
                    <Paginate num_items={data.subscription_num} page_size={20} current_page={page ? parseInt(page) : undefined} />}
            </div>
        </>
    );
};



interface Props {
    subscription: RawSubscription,
    mutate: any
};



const SubscriptionItem = ({ subscription, mutate }: Props) => {

    var { data: user, isLoading } = useUser(subscription.user_id);
    var route = useRouter();
    const [openUpdateModal, setOpenUpdateModal] = useState<boolean>(false);

    const handleUpdateError = (message: string) => {
        toast.error(message);
    };

    const handleUpdateSuccess = (message: string) => {
        toast.success(message);

        setOpenUpdateModal(false);
    
        mutate();
    };

    return (
        <>

            <SubscriptionModal
                editMode
                data={subscription}
                onError={handleUpdateError}
                onSuccess={handleUpdateSuccess}
                open={openUpdateModal}
                onCancel={() => setOpenUpdateModal(false)}
            />
            <TableRow>
                <TableCell>{subscription.id}</TableCell>
                <TableCell>
                    <div className="flex items-center">
                        {
                            isLoading || !user ? <UserBlockSkeleton /> : <UIBlock
                                title={user ? user.fullname + ` (@${user.username})` : ''}
                                image={<Avatar user={user} />}
                                subtitle={subscription.name}
                            />
                        }
                    </div>

                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        #{subscription.order_id}
                    </div>

                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        {Helper.getDay(subscription.start_date)}
                    </div>

                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        {Helper.getDay(subscription.end_date)}
                    </div>

                </TableCell>
                <TableCell>
                    <div className="flex items-center">
                        <PencilSquareIcon
                            title="Edit"
                            className="w-5 h-5 text-gray-500 cursor-pointer hover:text-gray-700"
                            onClick={() => setOpenUpdateModal(true)}
                        />
                    </div>
                </TableCell>
            </TableRow>
        </>

    )
}

export default SubscriptionList;