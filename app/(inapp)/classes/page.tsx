import type { Metadata } from 'next';

import { Blogs } from '@/app/(inapp)/_components/Blogs';

import { ClassesPage } from './ClassesPage';

export const metadata: Metadata = {
  title: 'Lớp học - WELE',
  description: 'Tất cả lớp học và bài tập của bạn',
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
];

export default function Page() {
  return (
    <div className="flex flex-col gap-12">
      <ClassesPage />
      <Blogs posts={BlogList} className="mb-12" />
    </div>
  );
}
