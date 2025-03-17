import OrderSubscriptions from './_components/OrdersSubscription';
import React, { Suspense } from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Subscription Orders - WELE',
}

const _RequestList = () => {
    return <Suspense>
        <OrderSubscriptions />
    </Suspense>
}

export default _RequestList;
