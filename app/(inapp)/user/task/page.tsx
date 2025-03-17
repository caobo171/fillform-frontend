import { Metadata } from 'next';

import { Task } from '@/app/(inapp)/user/task/Task';
import { CoinHistory } from '@/app/(inapp)/user/coin-history/CoinHistory';
import { Blogs } from '@/app/(inapp)/_components/Blogs';
import { ClientOnly } from '@/components/common/ClientOnly';

export const metadata: Metadata = {
  title: 'Nhiệm vụ của bạn - WELE',
  description: 'Nhiệm vụ của bạn - WELE',
};

const BlogList = [
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/b490b21a-eb6d-428b-bdfb-3b0b66fd64bf.jpeg',
    title: 'Bạn có thể sử dụng WELE Coins để làm gì?',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Những dịch vụ bạn có thể sử dụng WELE Coins để tăng cường kỹ năng nghe qua phương pháp nghe chép chính tả.',
    link: 'https://blog.wele-learn.com/ban-co-the-su-dung-wele-coins-de-lam-gi/',
  },
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
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/image-4.png',
    title: 'Cách kiếm “WELE xu” qua post trên mạng xã hội',
    published_at: '07/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Cách kiếm “WELE xu” qua post trên mạng xã hội như instagram, threads, facebook',
    link: 'https://blog.wele-learn.com/cach-kiem-wele-xu-qua-post-tren-mang-xa-hoi/',
  },


];

export default function Page() {
  return (
    <ClientOnly>
      <div className="flex flex-col gap-12">
        <Task />
        <Blogs posts={BlogList} className="mb-10" />
      </div>
    </ClientOnly>

  );
}

