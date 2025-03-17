'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Fetch from '@/lib/core/fetch/Fetch';
import * as _ from 'lodash';
import { Toast } from '@/services/Toast';
import { Helper } from '@/services/Helper';
import { BiArrowBack } from 'react-icons/bi';
import Constants, { Code, Pricing } from '@/core/Constants';
import { RawOrderSubscription } from '@/store/types';
import { MeHook } from '@/store/me/hooks';
import { useAsync } from 'react-use';
import Loading from '@/components/loading';
import UIBlock from '@/components/ui/UIBlock';
import { UserFunctions } from '@/store/user/functions';
import UserAvatar from '@/components/ui/Avatar';
import { UserHook } from '@/store/user/hooks';
import Link from 'next/link';
import { useParams } from 'next/navigation';
 



const OrderSubscriptionDetail = () => {

	const [reload_value, reload] = useState('');
	const id = useParams().id;
    const me = MeHook.useMe()
	const [is_open, setOpen] = useState(false);

	const request = useAsync(async () => {

		if (!me) {
			return null;
		}

		const res = await Fetch.postWithAccessToken<{
			order: RawOrderSubscription,
		}>('/api/subscription/order/get', {
			id
		});

		await res.data.order.user_id && UserFunctions.loadUserByIds([res.data.order.user_id]);

		if (res.data) {
			return res.data.order
		}

		return null;
	}, [id, reload_value, me]);

	const user = UserHook.useUser(request.value ? request.value.user_id : 0);

	if (request.loading) {
		return <></>
	}

	if (!request.value) {
		return <></>
	}

	//@ts-ignore
	const plan = Pricing.options[request.value?.plan as string];
	//@ts-ignore
	const period = Pricing.periods[request.value?.period as string];

	return (
		<>
			<div className='container mt-4 md:px-12 box-border mx-auto' style={{ maxWidth: 820 }}>
				<div className='bg-white shadow rounded mb-20 px-4 py-4'>

					<h3 className="text-xl font-medium text-gray-700 m-0 mb-3 flex flex-row items-center">
						<Link href='/user/me/orders'>
							<BiArrowBack className="mr-3 cursor-pointer text-gray-800" />
						</Link>
						Đơn hàng
					</h3>

					<div className="flex flex-col px-4 w-full  space-y-6">
						<h3 className="text-xl font-semibold leading-5 text-gray-800">Summary</h3>
						<div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
							<div className="flex justify-between items-center w-full mb-4">
								<p className="text-base leading-4 text-gray-800">Mã đơn hàng</p>
								<p className="text-baseleading-4 text-gray-600">{request.value.id}</p>
							</div>
							<div className="flex justify-between items-center w-full mb-4">
								<p className="text-base leading-4 text-gray-800">Tên gói</p>
								<p className="text-base leading-4 text-gray-600"><span className="bg-gray-200 p-2 rounded text-md font-medium leading-3 text-gray-800">{request.value.name}</span></p>
							</div>
							<div className="flex justify-between items-center w-full mb-4">
								<p className="text-base leading-4 text-gray-800">Người dùng đăng ký</p>
								<p className="text-base leading-4 text-gray-600">

									<UIBlock
										title={user ? user.fullname : 'Unknown user'}
										image={<UserAvatar user={user} />}
									/>
								</p>
							</div>
							<div className="flex justify-between items-center w-full mb-4">
								<p className="text-base leading-4 text-gray-800">Giá</p>
								<p className="text-base leading-4 text-gray-600">{request.value?.price}.000 VNĐ</p>
							</div>
						</div>
						<div className="flex justify-between items-center w-full">
							<p className="text-base font-semibold leading-4 text-gray-800">Tổng cộng</p>
							<p className="text-base font-semibold leading-4 text-gray-600">{request.value?.price}.000 VNĐ</p>
						</div>

						{
							Number(request.value.status) ? <div className="bg-green-100 rounded-md border-green-500 rounded-b text-green-900 px-4 py-3">
								<div className="flex">
									<div className="py-1"><svg className="fill-current h-6 w-6 text-green-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
									<div>
										<p className="font-bold">Đơn hàng của bạn đã được xử lý xong</p>
										<p className="text-sm">Có gì không hài lòng, hãy liên hệ chúng tôi</p>
									</div>
								</div>
							</div> : <div className="bg-blue-100 rounded-md border-blue-500 rounded-b text-blue-900 px-4 py-3">
								<div className="flex">
									<div className="py-1 hidden md:block"><svg className="fill-current h-6 w-6 text-blue-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zm12.73-1.41A8 8 0 1 0 4.34 4.34a8 8 0 0 0 11.32 11.32zM9 11V9h2v6H9v-4zm0-6h2v2H9V5z" /></svg></div>
									<div>
										<p className="font-bold">Đơn hàng của bạn đang được xử lý</p>
										<p className="text-sm">
											<p>Vui lòng chuyển khoản đến</p>
											<pre className='p-2 bg-gray-100'>VIB 001895728 Nguyen Van Cao</pre>
											<p>Nội dung chuyển khoản </p>
											<pre className='p-2 bg-gray-100'>WELE {request.value.id}</pre>
										</p>
										<img src={`https://img.vietqr.io/image/VIB-001895728-print.png?amount=${Number(request.value?.price) * 1000}&addInfo=WELE ${request.value?.id}&accountName=Nguyen Van Cao`}  />
								</div>
							</div>
							</div>
						}


				</div>


			</div>
		</div >
		</>
	)
};


export default OrderSubscriptionDetail