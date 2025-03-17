'use client'
import Paginate from '@/components/paginate/Paginate';
import React, { Suspense, useCallback, useState } from 'react';
import { RawOrderSubscription } from '@/store/types';
import { MeHook } from '@/store/me/hooks';
import Link from 'next/link';
import DateUtil from '@/services/Date';
import Avatar from '@/components/ui/Avatar';
import UIBlock from '@/components/ui/UIBlock';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSkeleton, TableTh } from '@/components/ui/Table';
import { useUserOrderSubscriptions } from '@/hooks/subscription.order';
import { useUser } from '@/hooks/user';
import { UserBlockSkeleton } from '@/components/block/UserBlock';
import { OrderDetailModal } from './OrderDetailModal';
import { UIButton } from '@/components/ui/Button';


const OrderSubscriptions = () => {

	const search_params = useSearchParams();
	const page = search_params.get('page');
	const page_size = 20
	const { data, isLoading, mutate } = useUserOrderSubscriptions(search_params, page_size);


	if (isLoading) {
		return <TableSkeleton num={5} cells={[80, null, 240, 230, 120]} />
	}

	if (!data) {
		return <div>Not found ...</div>
	}

	return (
		<>
			<div>

				<Table>
					<TableHead>
						<TableTh style={{ width: 80 }}>ID</TableTh>
						<TableTh>Đơn hàng</TableTh>
						<TableTh style={{ width: 240 }}>Trạng thái</TableTh>
						<TableTh style={{ width: 230 }}>Giờ tạo</TableTh>
						<TableTh style={{ width: 120 }}></TableTh>
					</TableHead>

					<TableBody>
						{
							(data.orders as RawOrderSubscription[]).map(e => (
								<OrderItem key={e.id} order={e} setReload={() => mutate()} />
							))
						}
					</TableBody>
				</Table>

				{data.order_num &&
					//@ts-ignore
					<div className='px-12'><Paginate num_items={data.order_num} page_size={20} current_page={page ? parseInt(page) : undefined} /></div>}
			</div>
		</>
	);
};



interface Props {
	order: RawOrderSubscription,
	setReload: any,
};



const OrderItem = ({ order, setReload }: Props) => {

	let { data: user, isLoading } = useUser(order.user_id);
	const [openModal, setOpenModal] = useState(false);

	const generateStatus = useCallback(() => {
		if (order.status == -1) {
			return <div className="bg-red-100 text-red-600 text-base px-4 py-2">Đã từ chối</div>;
		};

		if (order.status == 0) {
			return <div className="bg-blue-100 text-blue-600 text-base px-4 py-2">Đang xử lý</div>;
		}

		if (order.status == 1) {
			return <div className="bg-green-100 text-green-600 text-base px-4 py-2">Đã xử lý</div>;
		}

		return <div className="bg-gray-100 text-gray-600 text-base px-4 py-2">Không rõ</div>;
	}, [order]);


	return (
		<>
			<OrderDetailModal order={order} onError={() => { }} onSuccess={() => { }} open={openModal} onCancel={function (): void {
				return setOpenModal(false);
			}} />
			<TableRow>
				<TableCell>{order.id}</TableCell>
				<TableCell>
					<div className="flex items-center">
						{isLoading || !user ? <UserBlockSkeleton /> :
							<UIBlock
								title={user ? user.fullname : ''}
								image={<Avatar user={user} />}
								subtitle={order.name}
							/>
						}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center">
						{generateStatus()}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center">
						{DateUtil.getDayTime(order.since)}
					</div>
				</TableCell>
				<TableCell>
					<div className="flex items-center">
						<UIButton onClick={() => setOpenModal(true)} className='text-gray-700 hover:text-gray-900'>Chi tiết</UIButton>
					</div>
				</TableCell>
			</TableRow>
		</>


	)
}

export default () => {
	return <Suspense>
		<OrderSubscriptions />
	</Suspense>
};