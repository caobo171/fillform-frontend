import Constants, { LAYOUT_TYPES } from '@/core/Constants';

import { GetServerSideProps, GetStaticProps } from 'next';
import OrderSubscriptionDetail from './_components/OrderSubscriptionDetail' ;
// import ProductUserRequestDetail from 'pagecomponents/admin/request/detail/RequestProductInfo';
import React from 'react';

interface Props {
    id: any;
}



export default () => {
    return <OrderSubscriptionDetail />
}

