'use client'
import Loading from '@/components/loading';
import Paginate from '@/components/paginate/Paginate';
import React, { useCallback, useState } from 'react';
import Fetch from '@/lib/core/fetch/Fetch';
import { RawOrderSubscription } from '@/store/types';
import { useRouter } from 'next/navigation';
import SimpleDropDown from '@/components/ui/SimpleDropDown';
import CreateSubscriptionModal from './CreateSubcriptionModal';
import DateUtil from '@/services/Date';
import Avatar from '@/components/ui/Avatar';
import UIBlock from '@/components/ui/UIBlock';
import { Toast } from '@/services/Toast';
import { Code } from '@/core/Constants';
import { useSearchParams } from 'next/navigation';
import { Table, TableBody, TableCell, TableHead, TableRow, TableSkeleton, TableTh } from '@/components/ui/Table';
import { UIButton } from '@/components/ui/Button';
import { useOrderSubscriptions } from '@/hooks/subscription.order';
import { PageHeader } from '@/components/page/PageHeader';
import SearchItem from '@/components/layout/header/SearchItem';
import { IoSearch } from 'react-icons/io5';
import CreateOrderModal from './CreateOrderModal';
import { useUser } from '@/hooks/user';
import { UserBlockSkeleton } from '@/components/block/UserBlock';
import { OrderDetailModal } from './OrderDetailModal';


const OrderSubscriptions = () => {

	const search_params = useSearchParams();
	const page = search_params.get('page');
	const page_size = 20

	const [open, setOpen] = useState(false);


	const { data, isLoading, mutate } = useOrderSubscriptions(search_params, page_size);


	if (isLoading) {
		return <TableSkeleton num={5} cells={[80, null, 240, 230, 120]} />
	}

	if (!data) {
		return <div>Not found ...</div>
	}

	return (
		<>
			<PageHeader title='All orders' subtitle='Manage all subscriptions order in system' >
				<UIButton onClick={() => setOpen(true)}>
					Create order
				</UIButton>

				<CreateOrderModal open={open} setOpen={setOpen} finish={() => {
					setOpen(false);
					mutate();
				}} />
				<div className="none semi-xs:flex items-center bg-gray-100 rounded-lg">
					<label className="pr-2.5 pl-2 py-2" htmlFor="search"><IoSearch /></label>
					<SearchItem url={"/admin/subscription/orders"} />
				</div>
			</PageHeader>
			<div className='mt-8 flow-root'>

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
			</div>


			{data.order_num ?
				//@ts-ignore
				<div className='px-12'><Paginate num_items={data.order_num} page_size={20} current_page={page ? parseInt(page) : undefined} /></div> : <></>}

		</>
	);
};



interface Props {
	order: RawOrderSubscription,
	setReload: any,
};



const OrderItem = ({ order, setReload }: Props) => {

	let { data: user, isLoading } = useUser(order.user_id);
	var route = useRouter();
	const [open, setOpen] = useState(false);
	const [openModal, setOpenModal] = useState(false);

	const onFinishHandle = function () {
		setOpen(false);
		setReload();
	};

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


	const createSubscription = () => {
		setOpen(true)
	};

	const markAsPaid = async () => {
		const res: any = await Fetch.postWithAccessToken('/api/subscription/order/mark.paid', {
			user_id: order.user_id,
			order_id: order.id,
		});

		if (res.data && res.data.code == Code.SUCCESS) {
			setReload();
			Toast.success('Tạo yêu cầu thành công');
		} else if (res.data) {
			Toast.error(res.data.message);
		} else {
			Toast.error("Đã có lỗi xảy ra");
		}
	}

	return (
		<TableRow>
			<OrderDetailModal order={order} onError={() => { }} onSuccess={() => { }} open={openModal} onCancel={function (): void {
				return setOpenModal(false);
			}} />
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
					<SimpleDropDown
						hover={true}
						button={
							<UIButton variant='outline' href={'/user/subscription/orders/' + order.id}>Chi tiết</UIButton>
						}
						content={[
							{ text: "Chi tiết", onClick: () => { setOpenModal(true) } },
							{ text: "Đánh dấu đã thanh toán", onClick: () => markAsPaid() },
							{ text: "Tạo subscription", onClick: () => createSubscription() },
						]}
						timeout={0}
						from_left={false}
						class_width={'w-auto'}
					/>
				</div>
			</TableCell>
			<CreateSubscriptionModal finish={onFinishHandle} open={open} setOpen={setOpen} order={order} />
		</TableRow>
	)
}

export default OrderSubscriptions;