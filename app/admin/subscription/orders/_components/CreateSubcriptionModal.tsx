import React, { useEffect, useMemo, useState } from 'react';
import Fetch from '@/lib/core/fetch/Fetch';
import * as _ from 'lodash';
import { Toast } from '@/services/Toast';
import Modal from 'react-responsive-modal'

import { RawOrderSubscription } from '@/store/types';
import { MeHook } from '@/store/me/hooks';
import { Code, Pricing } from '@/core/Constants';
import UIBlock from '@/components/ui/UIBlock';
import { UserHook } from '@/store/user/hooks';
import DateUtil from '@/services/Date';
import Avatar from '@/components/ui/Avatar';
 


const CreateSubscriptionModal = ({ order, finish, open, setOpen }: { order: RawOrderSubscription, open: any, setOpen: any, finish: any }) => {
    const me = MeHook.useMe()

	let time = 3600 * 24 * 31;
	if (order.period == Pricing.periods.life_time.id) {
		time = 3600 * 24 * 31 * 1000;
	} else if (order.period == Pricing.periods.annually.id) {
		time = 3600 * 24 * 31 * 12;
	}

	const [state, setState] = useState({
		price: '',
		plan: '',
		start_date: DateUtil.dateToInputDate(DateUtil.time()),
		end_date: DateUtil.dateToInputDate(DateUtil.time() + time)
	})


	const user = UserHook.useUser(order.user_id);

	const onChangeHandle = (e: any) => {
		setState({
			...state,
			[e.target.name]: e.target.value
		});
	};


	const onSubmit = async () => {
		const res: any = await Fetch.postWithAccessToken('/api/subscription/create', {
			user_id: order.user_id,
			order_id: order.id,
			start_date: Math.floor(new Date(state.start_date).getTime() / 1000),
			end_date: Math.floor(new Date(state.end_date).getTime() / 1000),
		});

		if (res.data && res.data.code == Code.SUCCESS) {
			Toast.success('Tạo yêu cầu thành công');
			finish();
		} else if (res.data) {
			Toast.error(res.data.message);
		} else {
			Toast.error("Đã có lỗi xảy ra");
		}
	}


	return (
		<>
			<Modal
				classNames={{
					closeButton: `outline-none focus:outline-none`,
					modal: `rounded lg:w-1/2 sm:w-2/3 xs:w-5/6 w-11/12`
				}}
				open={open} onClose={() => { setOpen(false); }}>
				<h3 className="text-2xl font-medium text-gray-700 m-0 mb-3">Tạo subscription</h3>
				<div>
					<div>
						<div className="flex flex-col px-4 w-full bg-gray-100 pb-8 rounded space-y-6">
							<h3 className="text-xl font-semibold text-gray-800">Đơn hàng</h3>
							<div className="flex justify-center items-center w-full space-y-4 flex-col border-gray-200 border-b pb-4">
								<div className="flex justify-between items-center w-full mb-4">
									<p className="text-base leading-4 text-gray-800">Mã đơn hàng</p>
									<p className="text-base leading-4 text-gray-600">{order.id}</p>
								</div>
								<div className="flex justify-between items-center w-full mb-4">
									<p className="text-base leading-4 text-gray-800">Tên gói</p>
									<p className="text-base leading-4 text-gray-600"><span className="bg-gray-200 p-2 rounded text-md font-medium leading-3 text-gray-800">{order.name}</span></p>
								</div>
								<div className="flex justify-between items-center w-full mb-4">
									<p className="text-base leading-4 text-gray-800">Người dùng đăng ký</p>
									<p className="text-base leading-4 text-gray-600">

										<UIBlock
											title={user ? user.fullname : 'Unknown user'}
											image={<Avatar user={user} />}
										/>
									</p>
								</div>
								<div className="flex justify-between items-center w-full mb-4">
									<p className="text-base leading-4 text-gray-800">Giá</p>
									<p className="text-base leading-4 text-gray-600">{order.price}.000 VNĐ</p>
								</div>
							</div>
							<div className="flex justify-between items-center w-full">
								<p className="text-base font-semibold leading-4 text-gray-800">Tổng cộng</p>
								<p className="text-base font-semibold leading-4 text-gray-600">{order.price}.000 VNĐ</p>
							</div>

						</div>
						<div className="mt-3">
							<div className="text-base font-medium text-gray-500 mb-2">Ngày bắt đầu</div>
							<div className="w-full">
								<input
									className="w-full outline-none focus:outline-none border border-black border-opacity-20 focus:border-opacity-90 px-4 py-2 rounded text-base"
									type='date'
									value={state.start_date} name="start_date" onChange={onChangeHandle} placeholder="Ngày bất đầu"></input>
							</div>
						</div>
						<div className="mt-3">
							<div className="text-base font-medium text-gray-500 mb-2">Ngày hết hạn</div>
							<div className="w-full">
								<input
									className="w-full outline-none focus:outline-none border border-black border-opacity-20 focus:border-opacity-90 px-4 py-2 rounded text-base"
									type='date'
									value={state.end_date} name="end_date" onChange={onChangeHandle} placeholder="Ngày bất đầu"></input>
							</div>
						</div>
						<div className="flex justify-end mt-7">
							<button onClick={() => setOpen(false)} className="mr-1 outline-none focus:outline-none border-black text-black border border-opacity-20 hover:bg-gray-100 transition-all duration-200 text-base font-medium px-5 py-2" type="button">Quay lại</button>
							<button onClick={onSubmit} className="outline-none focus:outline-none border-black text-white border bg-black hover:bg-opacity-80 transition-all duration-200 text-base font-medium px-5 py-2" type="button">Tạo</button>
						</div>
					</div>
				</div>
			</Modal>
		</>
	)
};


export default CreateSubscriptionModal