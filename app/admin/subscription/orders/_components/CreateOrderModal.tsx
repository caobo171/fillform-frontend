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
import SingleUserPicker from '@/components/ui/SingleUserPicker';
import { UIButton } from '@/components/ui/Button';
 


const CreateOrderModal = ({ finish, open, setOpen }: { open: any, setOpen: any, finish: any }) => {
	const [period, setPeriod] = useState(Pricing.periods.annually.id);
	const [plan, setPlan] = useState(Pricing.options.premium.id);
	const [user, setUser] = useState<any>(null);

	const [state, setState] = useState({
		price: '',
		plan: '',
		start_date: DateUtil.dateToInputDate(DateUtil.time()),
		end_date: DateUtil.dateToInputDate(DateUtil.time())
	})


	useEffect(() => {
		let time = 3600 * 24 * 31;
		if (period == Pricing.periods.life_time.id) {
			time = 3600 * 24 * 31 * 1000;
		} else if (period == Pricing.periods.annually.id) {
			time = 3600 * 24 * 31 * 12;
		}

		setState({
			...state,
			end_date: DateUtil.dateToInputDate(DateUtil.time() + time)
		});

		return () => {

		}
	}, [state.start_date, period])

	const onChangeHandle = (e: any) => {
		setState({
			...state,
			[e.target.name]: e.target.value
		});
	};

	const onChangePeriod = (e: any) => {
		setPeriod(e.target.value)
	}

	const onChangePlan = (e: any) => {
		setPlan(e.target.value)
	}


	const onSubmit = async () => {
		const res: any = await Fetch.postWithAccessToken('/api/subscription/order/admin.create', {
			//@ts-ignore
			price: Pricing.options[plan].price[period],
			period: period,
			plan: plan,
			user_id: user ? user.id : '',
			//@ts-ignore
			name: `${Pricing.options[plan].name} ${Pricing.periods[period].name}`
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
					modal: `rounded xs:w-[520px] w-11/12`
				}}
				open={open} onClose={() => { setOpen(false); }}>
				<h3 className="text-2xl font-medium text-gray-700 m-0 mb-3">Tạo đơn hàng</h3>
				<div>
					<div>
						<div className="mt-3">
							<p className="text-base font-medium text-gray-500 mb-2">Tên gói</p>
							<select className="w-full outline-none focus:outline-none px-2 py-1 rounded-lg bg-gray-50 mr-3 border-2 border-transparent focus:border-primary transition-all" name="source_name" id="" onChange={onChangePlan}>
								{Object.keys(Pricing.options).map((key, index) => (
									//@ts-ignore
									<option value={key} key={index} selected={key == plan} >{(Pricing.options[key] as any).name}</option>
								))}
							</select>
						</div>
						<div className="mt-3">
							<p className="text-base font-medium text-gray-500 mb-2">Period</p>
							<select className="w-full outline-none focus:outline-none px-2 py-1 rounded-lg bg-gray-50 mr-3 border-2 border-transparent focus:border-primary transition-all" name="source_name" id="" onChange={onChangePeriod}>
								{Object.keys(Pricing.periods).map((key, index) => (
									//@ts-ignore
									<option value={key} key={index} selected={key == period} >{(Pricing.periods[key] as any).name}</option>
								))}
							</select>
						</div>
						<div className="mt-3">
							<p className="text-base font-medium text-gray-500 mb-2">Người dùng đăng ký</p>
							<div className="w-full">
								<SingleUserPicker onAddUser={async (user) => setUser(user)} />

								{
									user ? <p className="text-base dark:text-gray-300 leading-4 text-gray-600">


										<UIBlock
											title={user ? user.fullname : 'Unknown user'}
											image={<Avatar user={user} />}
										/>
									</p> : <></>
								}
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
						<div className="flex justify-end mt-8 gap-x-2">
							<UIButton variant='outline' onClick={() => setOpen(false)} >Quay lại</UIButton>
							<UIButton onClick={onSubmit} >Tạo</UIButton>
						</div>
					</div>
				</div>
			</Modal>
		</>
	)
};


export default CreateOrderModal