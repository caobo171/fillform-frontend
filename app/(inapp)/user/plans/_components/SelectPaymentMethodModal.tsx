import { zodResolver } from '@hookform/resolvers/zod';
import React, { ReactNode, useCallback, useState } from 'react';
import { Controller, SubmitHandler, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Input, Modal, ModalProps, TextArea } from '@/components/common';
import { Radio, RadioGroup } from '@headlessui/react'
import { RawOrderSubscription, RawSubscription } from '@/store/types';
import DateUtil from '@/services/Date';
import clsx from 'clsx';
import PaymentService from '@/lib/payment';
import { toast } from 'react-toastify';
import Fetch from '@/lib/core/fetch/Fetch';
import { useAsync } from 'react-use';
import { useUser } from '@/hooks/user';

const subscriptionSchema = z.object({
	startDate: z.string(),
	endDate: z.string(),
});

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>;

type SelectPaymentModalProps = {
	subscription?: RawSubscription;
	order?: RawOrderSubscription;
	openQRCode: () => void;
	onError: (message: string) => void;
	onSuccess: (message: string, subscription?: RawSubscription) => void;
  children?: ReactNode;
} & Omit<ModalProps, 'title' | 'okButtonProps'>;


const settings = [
	{ id: 'qr_code', name: 'Thanh toán bằng QR Code', description: 'Thanh toán bằng cách quét QR. Admin của WELE sẽ cập nhật gói đăng ký của bạn trong vòng 24h sau khi lệnh thanh toán được nhận.' },
	{ id: 'master_card', name: 'Thanh toán bằng Master Card / Google Pay', description: 'Hệ thống sẽ tự động cập nhật trạng thái của gói đăng ký ngay lập tức. Và sau khi gói đăng ký hết hạn, sẽ tự động tái đăng ký.' },
]

export function SelectPaymentModal(props: SelectPaymentModalProps) {
	const { onCancel, onError, onSuccess, subscription, openQRCode, children, ...rest } =
		props;

	const [selected, setSelected] = useState(settings[0]);

	const [loading, setLoading] = useState<boolean>(false);

	const handleCancel = () => {
		onCancel();
	};


	const paymentByLemonSqueezy = useCallback(async () => {
		setLoading(true);

		try {
			const url = await PaymentService.getCheckout();

			if (url) {
				window.location = url;
			} else {
				toast.error('Có lỗi xảy ra');
			}
		} catch (e) {
			toast.error('Có lỗi xảy ra');
		}

		setLoading(false);
	}, []);


	const handleSubmit = async () => {
		if (selected.id == 'qr_code') {
			openQRCode();
			return;
		}


		if (selected.id == 'master_card') {

			await paymentByLemonSqueezy();
		}

		onSuccess('Thanh toán thành công');
	};


	return (
		<Modal
			title={'Chọn phương thức thanh toán'}
			okText={'Tiếp tục'}
			width="600px"
			onCancel={handleCancel}
			// eslint-disable-next-line
			// @ts-ignore
			onOk={() => handleSubmit()}
			okButtonProps={{ loading: loading }}
			panelClassName="overflow-visible"
			{...rest}
		>

			<div className="text-sm flex flex-col gap-6 py-4">
				<div className="flex gap-6">
					<RadioGroup value={selected} onChange={setSelected} className="-space-y-px rounded-md bg-white">
						{settings.map((setting, settingIdx) => (
							<Radio
								key={setting.name}
								value={setting}
								aria-label={setting.name}
								aria-description={setting.description}
								className={clsx(
									settingIdx === 0 ? 'rounded-tl-md rounded-tr-md' : '',
									settingIdx === settings.length - 1 ? 'rounded-bl-md rounded-br-md' : '',
									'group relative flex cursor-pointer border border-gray-200 p-4 focus:outline-none data-[checked]:z-10 data-[checked]:border-red-200 data-[checked]:bg-red-50',
								)}
							>
								<span
									aria-hidden="true"
									className="mt-0.5 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-gray-300 bg-white group-data-[checked]:border-transparent group-data-[checked]:bg-red-600 group-data-[focus]:ring-2 group-data-[focus]:ring-red-600 group-data-[focus]:ring-offset-2"
								>
									<span className="h-1.5 w-1.5 rounded-full bg-white" />
								</span>
								<span className="ml-3 flex flex-col">
									<span className="block text-sm font-medium text-gray-900 group-data-[checked]:text-red-900">
										{setting.name}
									</span>
									<span className="block text-sm text-gray-500 group-data-[checked]:text-red-700">
										{setting.description}
									</span>
								</span>
							</Radio>
						))}
					</RadioGroup>
				</div>
			</div>

      {children}
		</Modal>
	);
}
