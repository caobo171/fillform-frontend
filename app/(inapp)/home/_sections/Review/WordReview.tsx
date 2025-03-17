'use client';

import { PremiumIcon } from '@/components/common';
import { useWordReviews } from '@/hooks/word.review';
import { ArrowLongRightIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';

export function WordReview() {

    const state = useWordReviews();

    if (!state.data?.word_reviews || state.data?.word_reviews.length === 0) {
        return <></>
    }

    return (
        <Link
            href="/review"
            className="group cursor-pointer bg-cover bg-center bg-primary-600 py-4 rounded-lg flex items-center justify-center -mb-4"
        >
            <div className="flex items-center space-between gap-4">
                <p className="text-sm font-bold text-white">
                    Ôn tập từ đang học
                </p>

                <PremiumIcon />

                <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center group-hover:translate-x-1 duration-200">
                    <ArrowLongRightIcon className="w-5 h-5 text-primary" />
                </span>
            </div>
        </Link>
    );
}
