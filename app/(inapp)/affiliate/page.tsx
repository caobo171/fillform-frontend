import { Metadata, ResolvingMetadata } from 'next';
import React from 'react';
import { MetaData } from '@/core/Metadata';
import AffiliateComponent from './_components/Affiliate';
import AffiliateClientWrapper from './_components/AffiliateClientWrapper';

type Props = {
    params: { id: string };
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
    _: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || [];

    return {
        metadataBase: new URL(MetaData.landingPageDomain),
        title: 'Chương trình Affiliate | FillForm',
        description: 'Tham gia chương trình affiliate của FillForm để nhận hoa hồng từ việc giới thiệu người dùng mới.',
        alternates: {
            canonical: MetaData.defaultCanonical,
            languages: MetaData.defaultLanguages,
        },
        openGraph: {
            images: ['https://app.survify.info/static/img/background.jpg', ...previousImages],
        },
    };
}

export default function Affiliate() {
    return (
        <AffiliateClientWrapper />
    );
}