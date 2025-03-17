import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
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

const orderSchema = z.object({
	coupon_code: z.string(),
	image: z.union([z.array(z.any()), z.array(z.string())]),
});

type SubscriptionFormValues = z.infer<typeof orderSchema>;

type OrderDetailModalProps = {
	order?: RawOrderSubscription;
	onError: (message: string) => void;
	onSuccess: (message: string, order?: RawSubscription) => void;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;


export function OrderDetailModal(props: OrderDetailModalProps) {
	const { onCancel, onError, onSuccess, order, ...rest } = props;

	const {
		handleSubmit,
		control,
		reset,
		setValue,
		formState: { errors, isSubmitting },
	} = useForm<SubscriptionFormValues>({
		defaultValues: {
			coupon_code: order?.coupon_code,
			image: [order?.image_url],
		},
		resolver: zodResolver(orderSchema),
	});

	const user = useUser(order?.user_id || 0);

	const [loading, setLoading] = useState<boolean>(false);

	const handleCancel = () => {
		reset();
		onCancel();

	};

    const onSubmit = () => {
        
    }

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
			<div className='box-border mx-auto'>

				{false ? <Loading className="text-primary h-6 w-6 my-20 mx-auto" /> : <>
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
														<img src={`https://img.vietqr.io/image/VIB-001895728-print.png?amount=${Number(order?.price) * 1000}&addInfo=WELE ${order?.id}&accountName=Nguyen Van Cao`} />
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
