import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Input, Loading, Modal, ModalProps, TextArea } from '@/components/common';
import { Radio, RadioGroup } from '@headlessui/react'
import { RawOrderSubscription, RawSubscription } from '@/store/types';
import DateUtil from '@/services/Date';
import UserAvatar from '@/components/ui/Avatar';
import PaymentService from '@/lib/payment';
import { toast } from 'react-toastify';
import Fetch from '@/lib/core/fetch/Fetch';
import UIBlock from '@/components/ui/UIBlock';
import { useUser } from '@/hooks/user';
import { useAsync } from 'react-use';
import { AnyObject } from '@/store/interface';
import { FileUploader } from '@/components/form/FileUploader';
import { PhotoIcon } from '@heroicons/react/24/outline';
import useSWR from 'swr';
import { Pricing } from '@/core/Constants';

const subscriptionSchema = z.object({
	coupon_code: z.string(),
	image: z.union([z.array(z.any()), z.array(z.string())]),
	period: z.string(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

type QRCodeModalProps = {
	subscription?: RawSubscription;
	order?: RawOrderSubscription;
	onError: (message: string) => void;
	onSuccess: (message: string, subscription?: RawSubscription) => void;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;


export function QRCodeModal(props: QRCodeModalProps) {
	const { onCancel, onError, onSuccess, subscription, ...rest } = props;

	const { data, isLoading, mutate } = useSWR(['/api/subscription/order/get', subscription?.id], async () => {
		if (!subscription) {
			return;
		}

		const res = await Fetch.postWithAccessToken<{
			order: RawOrderSubscription,
		}>('/api/subscription/order/get', {
			subscription_id: subscription?.id
		});

		if (res.data) {
			return res.data.order
		}

		return null;
	});

	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SubscriptionFormValues>({
		defaultValues: {
			coupon_code: data?.coupon_code,
			image: [data?.image_url],
			period: data?.period,
		},
		resolver: zodResolver(subscriptionSchema),
	});

	const periodValue = useWatch({ control, name: 'period', defaultValue: 'annually' });

	const priceValue = Pricing.options[(data?.plan || 'premium') as keyof typeof Pricing.options].price[periodValue as keyof typeof Pricing.periods];

	const user = useUser(data?.user_id || 0);

	const [loading, setLoading] = useState<boolean>(false);

	const handleCancel = () => {
		reset();
		onCancel();

	};

	useEffect(() => {
		setValue('coupon_code', data?.coupon_code || '');
		setValue('image', data?.image_url ? [data?.image_url] : ([] as string[]));
		setValue('period', data?.period || '');
	}, [data]);

	const onSubmit: SubmitHandler<SubscriptionFormValues> = async (formData) => {

		const currentPeriod = Pricing.periods[formData.period as keyof typeof Pricing.periods];
		const plan = Pricing.options[(data?.plan || 'premium') as keyof typeof Pricing.options];
		const name = `${plan.name} ${currentPeriod.name}`;

		setLoading(true);
		const res: AnyObject = await Fetch.postWithAccessToken<ResponseType>(
			`/api/subscription/order/confirm`,
			{
				id: data?.id,
				image: formData.image[0],
				coupon_code: formData.coupon_code,
				period: formData.period,
				price: priceValue,
				plan: data?.plan || 'premium',
				name: name,
			}
		);


		setLoading(false);
		mutate();
		onSuccess('Bạn chờ chút nhé, admin WELE sẽ xử lý');
	};

	const order = data;

	return (
		<Modal
			title={'Thanh toán bằng QR Code'}
			okText={'Xác nhận đã thanh toán'}
			width="600px"
			onCancel={handleCancel}
			// eslint-disable-next-line
			// @ts-ignore
			onOk={handleSubmit(onSubmit)}
			okButtonProps={{ loading: loading }}
			panelClassName="overflow-visible"
			{...rest}
		>
			<div className="h-screen-70 md:h-screen-80 overflow-y-auto overflow-x-hidden -mx-4 sm:-mx-6 sm:px-6 custom-scrollbar">

				{isLoading ? <Loading className="text-primary h-6 w-6 my-20 mx-auto" /> : <>
					<div>
						<div className="px-4 sm:px-0">
							<p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Thông tin đơn hàng</p>
						</div>
						<div className="mt-6 border-t border-gray-100">
							<dl className="divide-y divide-gray-100">
								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Mã đơn hàng</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">{order?.id}</dd>
								</div>
								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Người dùng đăng ký</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">

										<UIBlock
											title={user?.data ? user.data.fullname : 'Unknown user'}
											image={user?.data ? <UserAvatar user={user?.data} /> : <></>}
										/>
									</dd>
								</div>
								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Giá</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">
										{order?.price}.000 VNĐ
									</dd>
								</div>

								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Chọn gói</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">

										<Controller

											name="period"
											control={control}
											render={({ field }) => <>
												<fieldset aria-label="Period">
													<div className="space-y-5">
														<RadioGroup className="space-y-4" {...field} value={field.value}>
															{Object.values(Pricing.periods).map((period) => {
																const optionPrice = Pricing.options[(data?.plan || 'premium') as keyof typeof Pricing.options].price[period.id as keyof typeof Pricing.periods];
																return (
																	<Radio
																		key={period.name}
																		aria-label={period.name}
																		{...field}
																		value={period.id}
																		className="group relative block cursor-pointer rounded-lg border border-gray-300 bg-white px-6 py-4 shadow-sm focus:outline-none data-[focus]:border-indigo-600 data-[focus]:ring-2 data-[focus]:ring-indigo-600 sm:flex sm:justify-between"
																	>
																		<span className="flex items-center">
																			<span className="flex flex-col text-sm">
																				<span className="font-medium text-gray-900">{period.name}</span>
																				<span className="text-gray-500">

																				</span>
																			</span>
																		</span>
																		<span className="mt-2 flex text-sm sm:ml-4 sm:mt-0 sm:flex-col sm:text-right">
																			<span className="font-medium text-gray-900">{optionPrice + '.000 VNĐ'}</span>
																			<span className="ml-1 text-gray-500 sm:ml-0">{period.name}</span>
																		</span>
																		<span
																			aria-hidden="true"
																			className="pointer-events-none absolute -inset-px rounded-lg border-2 border-transparent group-data-[focus]:border group-data-[checked]:border-indigo-600"
																		/>
																	</Radio>
																)
															})}
														</RadioGroup>
														{/* {Object.values(Pricing.periods).map((period) => (
															<div key={period.id} className="relative flex items-start">
																<div className="flex h-6 items-center pointer">
																	<input
																		defaultChecked={period.id == field.name}
																		id={period.id}
																		{...field}
																		type="radio"
																		value={period.id}
																		aria-describedby={`${period.id}-description`}
																		className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600"
																	/>
																</div>
																<div className="ml-3 text-sm leading-6">
																	<label htmlFor={period.id} className="font-medium text-gray-900">
																		{period.name}
																	</label>
																</div>
															</div>
														))} */}
													</div>
												</fieldset>

											</>}
										/>
									</dd>
								</div>

								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Mã giảm giá</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">

										<Controller

											name="coupon_code"
											control={control}
											render={({ field }) => <Input type="text" placeholder="Nhập mã giảm giá nếu có" {...field} />}
										/>
									</dd>
								</div>
								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">Đính kèm ảnh đã chuyển khoản</dt>
									<dd className="mt-1 text-sm leading-6 text-gray-700 sm:col-span-2 sm:mt-0">

										<Controller
											render={({ field: { onChange, ...props } }) => (
												<FileUploader
													icon={<PhotoIcon className="w-10 text-gray-500" />}
													onChange={onChange}
													{...props}
												/>
											)}
											name="image"
											control={control}
										/>
									</dd>
								</div>

								<div className="px-4 py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
									<dt className="text-sm font-medium leading-6 text-gray-900">QR Code</dt>
									<dd className="mt-2 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
										{
											Number(order?.status) ? <div className="bg-green-100 rounded-md border-green-500 rounded-b text-green-900 px-4 py-3">
												<div className="flex">

													<div>
														<p className="font-bold">Đơn hàng của bạn đã được xử lý xong</p>
														<p className="text-sm">Có gì không hài lòng, hãy liên hệ chúng tôi</p>
													</div>
												</div>
											</div> : <div className="bg-blue-100 rounded-md border-blue-500 rounded-b text-blue-900 px-4 py-3">
												<div className="flex">

													<div>
														<p className="font-bold">Đơn hàng của bạn đang được xử lý</p>
														<p className="text-sm flex gap-y-2 flex-col">
															<p>Vui lòng chuyển khoản đến</p>
															<pre className='p-2 bg-gray-100'>VIB 001895728 Nguyen Van Cao</pre>
															<p>Nội dung chuyển khoản </p>
															<pre className='p-2 bg-gray-100'>WELE {order?.id}</pre>
														</p>
														<img src={`https://img.vietqr.io/image/VIB-001895728-print.png?amount=${Number(priceValue) * 1000}&addInfo=WELE ${order?.id}&accountName=Nguyen Van Cao`} />
													</div>
												</div>
											</div>
										}
									</dd>
								</div>
							</dl>
						</div>
					</div>
				</>}

			</div>
		</Modal>
	);
}
