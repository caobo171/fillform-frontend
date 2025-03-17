import { Metadata } from 'next';
import React from 'react';

import { Blogs } from '@/app/(inapp)/_components/Blogs';
import { Ads } from '@/app/(inapp)/podcasts/_components/Ads';
import { PodcastList } from '@/app/(inapp)/podcasts/_components/PodcastsList';
import { Container } from '@/components/layout/container/container';

export const metadata: Metadata = {
  title: 'Podcasts - WELE',
};

const BlogList = [
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/11/1f5066e8-e631-4e95-b4c0-10ef6029227c.jpg',
    title: '6 minute English – nguồn nghe chép tiệm cận BBC news',
    published_at: '02/11/2024',
    author_name: 'Le Trung Hieu',
    description:
      '6-minute English là chuỗi bài nghe từ rất lâu đời của BBC Learning English. BBC Learning English đã từng sản xuất rất nhiều chương trình (cũng như Đài Truyền Hình Việt Nam) vậy',
    link: 'https://blog.wele-learn.com/6-minute-english-nguon-nghe-chep-tiem-can-bbc-news/',
  },
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/11/0d905aa6-18ae-4384-b388-cf9aadc2ad09.jpg',
    title:
      'Vì sao Spotlight English là nguồn nghe tốt nhất để nghe chép chính tả',
    published_at: '02/11/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Spotlight English được chia sẻ từ https://spotlightenglish.com. Với các bạn nghe quen, câu mở đầu mỗi bài luôn là “Spotlight English uses a special method of broadcasting that makes it easier to understand for listeners worldwide”.',
    link: 'https://blog.wele-learn.com/vi-sao-spotlight-english-la-nguon-nghe-tot-nhat-de-nghe-chep-chinh-ta/',
  },
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
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/9d567eee-47d7-4441-a18a-a7bbf47a0f00.jpeg',
    title: 'Cách sử dụng Playlist để hỗ trợ nghe chép chính tả',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Playlist là một công cụ tuyệt vời để lưu lại các bài nghe yêu thích và chia sẻ với mọi người, cùng nhau nghe chép chính tả.',
    link: 'https://blog.wele-learn.com/cach-su-dung-playlist-de-ho-tro-nghe-chep-chinh-ta/',
  },
];

export default function Page() {
  return (
    <Container className="flex flex-col gap-20 py-6">
      <div className="flex justify-between gap-8">
        {/* Left Block */}
        <PodcastList />

        {/* Right Block */}
        <Ads />
      </div>

      <Blogs posts={BlogList} />
    </Container>
  );
}
