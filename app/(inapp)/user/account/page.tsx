import type { Metadata } from 'next';

import { Blogs } from '@/app/(inapp)/_components/Blogs';
import { AccountPage } from '@/app/(inapp)/user/account/AccountPage';

export const metadata: Metadata = {
  title: 'Thông tin tài khoản - WELE',
  description: 'Thông tin tài khoản',
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
];

export default function Page() {
  return (
    <div className="flex flex-col gap-12">
      <AccountPage />
      <Blogs posts={BlogList} className="mb-10" />
    </div>
  );
}
