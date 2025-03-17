import { Metadata, ResolvingMetadata } from 'next';
import React, { Suspense, lazy } from 'react';
// react-slick styles
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { BlogMinimal } from '@/app/(inapp)/_components/BlogMinimal';
import { Container } from '@/components/layout/container/container';
import { MetaData } from '@/core/Metadata';

import './_sections/Promotion/ads.css';
import { WordReview } from './_sections/Review/WordReview';
import { ClientOnly } from '@/components/common/ClientOnly';

const RecentPodcasts = lazy(() => import('./_sections/RecentPodcasts'));
const NewReleasePodcasts = lazy(() => import('./_sections/NewReleasePodcasts'));
const RecommendPodcasts = lazy(() => import('./_sections/RecommendPodcasts'));
const Source = lazy(() => import('./_sections/Source'));
const WeeklyLeaderBoard = lazy(() => import('./_sections/WeeklyLeaderBoard'));
const PopularPodcasts = lazy(() => import('./_sections/PopularPodcasts'));
const Ads = lazy(() => import('./_sections/Promotion/AdsCarousel'));
const NewsFeed = lazy(() => import('./_sections/NewsFeed'));
const ChallengeCarousel = lazy(
  () => import('./_sections/Promotion/ChallengeCarousel')
);

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
      images: ['https://wele-learn.com/static/logo.png', ...previousImages],
    },
  };
}

const BlogList = [
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/17716d66-72b3-4f9e-a6dc-cad6c2bfabf8.jpeg',
    title: 'Lộ trình cho các bạn mới luyện nghe',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Lộ trình cho các bạn mới bắt đầu luyện nghe, phương pháp nghe chép chính tả',
    link: 'https://blog.wele-learn.com/lo-trinh-cho-cac-ban-moi-luyen-nghe/',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 pt-8 pb-[80px] mb-[-50px]">
      <Container className="flex">
        <div className="w-[800px] flex flex-col gap-[56px]">
          <Suspense fallback={null}>
            <ClientOnly>
              <ChallengeCarousel />
            </ClientOnly>

          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <RecentPodcasts />
          </Suspense>

          <Ads />

          <Suspense fallback={<div>Loading...</div>}>
            <NewReleasePodcasts />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <Source />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <RecommendPodcasts />
          </Suspense>
        </div>

        <div className="flex-1 flex flex-col gap-[48px] border-l-[1px] border-gray-200 pl-10 ml-10">
          <WordReview />

          <BlogMinimal posts={BlogList} />

          <Suspense fallback={<div>Loading...</div>}>
            <WeeklyLeaderBoard />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <NewsFeed />
          </Suspense>

          <Suspense fallback={<div>Loading...</div>}>
            <PopularPodcasts />
          </Suspense>
        </div>
      </Container>
    </div>
  );
}
