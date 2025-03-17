import { Metadata, ResolvingMetadata } from 'next';
import React from 'react';

import { TopNav } from '@/app/(outside)/_components/TopNav';
import { About } from '@/app/(outside)/_sections/About';
import { CTA } from '@/app/(outside)/_sections/CTA';
import { FAQ } from '@/app/(outside)/_sections/FAQ';
import { Feature } from '@/app/(outside)/_sections/Feature';
import { Footer } from '@/app/(outside)/_sections/Footer';
import { Hero } from '@/app/(outside)/_sections/Hero';
import { MobileApp } from '@/app/(outside)/_sections/MobileApp';
import { Partner } from '@/app/(outside)/_sections/Partner';
import { HomePricing } from '@/app/(outside)/_sections/Pricing';
import { Source } from '@/app/(outside)/_sections/Source';
import { Stats } from '@/app/(outside)/_sections/Stats';
import { Testimonial } from '@/app/(outside)/_sections/Testimonial';
import { Container } from '@/components/layout/container/container';
import { MetaData } from '@/core/Metadata';

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
    keywords: MetaData.defaultKeywords,
    title: MetaData.defaultTitle,
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

export default function Home() {
  return (
    <div>
      <TopNav />
      <Hero />
      <Partner />
      <About />
      <Container>
        <div className="border-t border-neutral-100" />
      </Container>
      <Stats />
      <Source />
      <MobileApp />
      <Feature />
      <HomePricing />
      <CTA />
      <Testimonial />
      <FAQ />
      <Footer />
    </div>
  );
}
