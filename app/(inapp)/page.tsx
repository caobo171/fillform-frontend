import { Metadata, ResolvingMetadata } from 'next';
import React, { Suspense, lazy } from 'react';
// react-slick styles
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import { MetaData } from '@/core/Metadata';
import HomeComponent from './_components/Home';

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
    title: MetaData.defaultTitle,
    description: MetaData.defaultDescription,
    alternates: {
      canonical: MetaData.defaultCanonical,
      languages: MetaData.defaultLanguages,
    },
    openGraph: {
      images: ['https://app.survify.info/static/img/background.jpg', ...previousImages],
    },
  };
}
export default function Home() {
  return (
    <HomeComponent />
  );
}
