import { ClientOnly } from '@/components/common/ClientOnly';
import OrdersSubscription from './_components/OrdersSubscriptions';
import Constants, { LAYOUT_TYPES } from '@/core/Constants';
import React from "react";

const Index = () => {
	return (<>
		<ClientOnly>
			<OrdersSubscription />
		</ClientOnly>

	</>)
}


//@ts-ignore
Index.layout = LAYOUT_TYPES.Profile;

export default Index;