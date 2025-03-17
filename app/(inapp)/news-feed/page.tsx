import { Metadata, ResolvingMetadata } from 'next';
import React from 'react';

import { MetaData } from '@/core/Metadata';

import { NewsFeeds } from './_components/NewsFeeds';
import './news-feed.css';

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // optionally access and extend (rather than replace) parent metadata
  const previousImages = (await parent).openGraph?.images || [];

  return {
    metadataBase: new URL(MetaData.landingPageDomain),
    title: 'News feed - We enjoy learning english',
    description: MetaData.defaultDescription,
    alternates: {
      canonical: MetaData.defaultCanonical,
      languages: MetaData.defaultLanguages,
    },
    openGraph: {
      images: [
        'https://wele-learn.com/static/landing_page2.png',
        'https://wele-learn.com/static/logo.png',
        ...previousImages,
      ],
    },
  };
}

function Page() {
  return (
    <div className="bg-gray-100">
      <NewsFeeds />
    </div>
  );
}

export default Page;
