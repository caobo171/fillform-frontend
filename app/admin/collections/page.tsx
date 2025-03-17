import React, { Suspense } from 'react';
import { Metadata } from 'next';
import {
  CollectionList
} from '@/app/admin/collections/_components/CollectionList';

export const metadata: Metadata = {
  title: 'Collections - WELE',
}

export default () => {

	return <Suspense>
		<CollectionList />
	</Suspense>;
}

