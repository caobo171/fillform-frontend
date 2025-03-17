import React, { Suspense } from 'react';
import { SourceList } from '@/app/admin/sources/_components/SourceList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sources - WELE',
}

export default () => {

	return <Suspense>
		<SourceList />
	</Suspense>;
}

