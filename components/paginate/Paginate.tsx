import React, { useCallback, useMemo } from 'react';
import * as _ from 'lodash';
import Link from 'next/link';
import { Hook } from '@/services/Hook';

import { BsArrowLeft, BsArrowRight } from 'react-icons/bs';
import { Helper } from '@/services/Helper';
import { useRouter, useSearchParams } from 'next/navigation';
import clsx from 'clsx';
import { ArrowLongLeftIcon, ArrowLongRightIcon } from '@heroicons/react/20/solid'


interface Props {
	num_items: number,
	page_size?: number
}

export const Pagination = React.memo((props: Props) => {

	const { num_items } = props;


	let page_size = props.page_size || 12;

	const page = useSearchParams().get('page');
	const real_current_page = useMemo(() => page ? Number(page) : 1, [page]);

	const pages = useMemo(() => {
		const start = 1;
		var end = page_size > 0 ? Math.floor(num_items / page_size) + 1 : 1;
		if (num_items % page_size != 0) {
			end += 1;
		}
		return _.range(start, end);
	}, [num_items, page_size])

	const paginateRender = (page_index: number) => {
		return Helper.setAndGetURLParam([{ key: 'page', value: page_index }])
	};


	const RightPart = () => {
		return <div className="-mt-px flex w-0 flex-1 justify-end">
			<Link
				href={`?${paginateRender(Math.max(pages.length, real_current_page + 1))}`}
				className="inline-flex items-center border-b-2 border-transparent pl-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
			>
				Next
				<ArrowLongRightIcon className="ml-3 h-5 w-5 text-gray-400" aria-hidden="true" />
			</Link>
		</div>
	};


	const LeftPart = () => {
		return <div className="-mt-px flex w-0 flex-1">
			<Link href={`?${paginateRender(real_current_page - 1)}`}
				className="inline-flex items-center border-b-2 border-transparent pr-1 pb-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"
			>
				<ArrowLongLeftIcon className="mr-3 h-5 w-5 text-gray-400" aria-hidden="true" />
				Previous
			</Link>
		</div>
	};


	const PageIndex = (page_index: number, active: boolean = false) => {
		return <Link key={page_index} className={
			clsx("inline-flex items-center border-b-2 border-transparent px-4 pb-4 text-sm font-medium hover:border-gray-300 hover:text-gray-700",
				active ? 'font-bold text-primary' : 'text-gray-500')} href={`?${paginateRender(page_index)}`} >
			{page_index}
		</Link>
	}


	const PageDots = () => {
		return <span className="inline-flex items-center border-b-2 border-transparent px-4 pb-4 text-sm font-medium text-gray-500">
			...
		</span>
	}

	if (pages.length > 6) {
		if (real_current_page > pages.length - 2) {
			return <Wrapper>
				{LeftPart()}
				{PageIndex(1)}
				{PageIndex(2)}
				{PageDots()}
				{
					pages.slice(real_current_page - 2, pages.length).map(e => PageIndex(e, real_current_page == e))
				}
				{RightPart()}
			</Wrapper>
		} else if (real_current_page < 3) {
			return <Wrapper>
				{LeftPart()}
				{[1, 2, 3].map(e => PageIndex(e, real_current_page == e))}
				{PageDots()}
				{pages.slice(pages.length - 3, pages.length).map(e => PageIndex(e, real_current_page == e))}
				{RightPart()}
			</Wrapper>
		} else {
			return <Wrapper>
				{LeftPart()}
				{[1, 2].map(e => PageIndex(e, real_current_page == e))}
				{PageDots()}
				{pages.slice(real_current_page - 1, real_current_page + 1).map(e => PageIndex(e, real_current_page == e))}
				{PageDots()}
				{pages.slice(pages.length - 2, pages.length).map(e => PageIndex(e, real_current_page == e))}
				{RightPart()}
			</Wrapper>
		}
	}
	return (
		<Wrapper>
			{LeftPart()}
			{
				pages.map(e => PageIndex(e, real_current_page == e))
			}
			{RightPart()}
		</Wrapper>
	)
});

function Wrapper(props: { children: React.ReactNode }) {

	return <nav className="flex width-full items-center justify-between py-20  px-4 sm:px-0">
		{props.children}
	</nav>
}



export default Pagination;

Pagination.displayName = 'Pagination';