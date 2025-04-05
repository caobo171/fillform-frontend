import Link from "next/link";
import DateUtil from "@/services/Date";

export const SubscriptionBanner = () => {


	let sub_text = 'Upgrade your plan to access more power of Fillform';
	let free_trial = ''

	// if (sub) {
	// 	if (sub.period == 'life_time') {
	// 		sub_text = 'Your subscription is available forever';
	// 	} else {
	// 		sub_text = 'Gói đăng ký của bạn sẽ được gia hạn vào ngày  ' + DateUtil.getDay(sub.end_date)
	// 	}

	// 	if (!sub.status) {
	// 		sub_text = 'Bản dùng thử của bạn sẽ kết thúc vào ngày ' + DateUtil.getDay(sub.end_date);
	// 		free_trial = '(7 days free trial)'
	// 	}
	// }



	return (<>
		<section className="bg-gray-100 rounded-md">
			<div className="py-12 px-8 mx-auto max-w-screen-xl">
				{/* <div className="mx-auto max-w-screen-sm text-left">
					<h2 className="mb-4 text-4xl tracking-tight font-extrabold leading-tight text-gray-900 dark:text-primary capitalize">{sub ? sub.plan.toLowerCase() : 'Free'} Plan {free_trial}</h2>
					<p className="mb-6 font-light text-gray-500 dark:text-gray-400 md:text-lg">
						{sub_text}
					</p>
					{!sub ?
						<Link href="/pricing" className="text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary-light font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2  focus:outline-none">Upgrade to premium now</Link> :
						<></>
					}

					{
						sub && !sub.status ?
							<Link href={`/user/me/orders/${sub.order_id}`} className="text-white bg-primary hover:bg-primary-dark focus:ring-4 focus:ring-primary-light font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2  focus:outline-none">Pay now</Link> :
							<></>
					}
				</div> */}
			</div>
		</section>
	</>
	)
};