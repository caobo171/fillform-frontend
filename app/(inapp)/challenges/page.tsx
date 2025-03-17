import type { Metadata } from 'next';

import { Blogs } from '@/app/(inapp)/_components/Blogs';

import { Challenges } from './Challenges';

export const metadata: Metadata = {
  title: 'Thử thách - WELE',
  description: 'Tất cả thử thách của WELE',
};

const BlogList = [
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/e0f343be-5dbd-4ef6-8f32-d0dcb5236351.jpeg',
    title: 'Các cách thức bạn có thể kiếm thêm WELE Coins',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Cách thức bạn có thể kiếm được WELE Coins để sử dụng trong các công cụ nâng cao tốc độ luyện nghe tiếng Anh',
    link: 'https://blog.wele-learn.com/cac-cach-thuc-ban-co-the-kiem-them-wele-coins/',
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
];

export default function Page() {
  return (
    <div className="flex flex-col gap-4">
      <Challenges />
      <Blogs posts={BlogList} className="mb-12" />
    </div>
  );
}
