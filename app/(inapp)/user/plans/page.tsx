import { Metadata } from 'next';

import { Blogs } from '@/app/(inapp)/_components/Blogs';
import { PlansPage } from '@/app/(inapp)/user/plans/PlansPage';

export const metadata: Metadata = {
  title: 'Gói dịch vụ của bạn - WELE',
  description: 'Gói dịch vụ của bạn - WELE',
};

const BlogList = [
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/730077ab-03aa-4ea8-8d3f-516e3a180ad2.jpeg',
    title: 'Quyền lợi của WELE Premium Users',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'Ngoài các tính năng và công cụ vô cùng hiệu quả để luyện nghe cho các free users, WELE giới thiệu gói premium package trong đó users sẽ có thêm các công cụ sau 1.',
    link: 'https://blog.wele-learn.com/quyen-loi-cua-wele-premium-users/',
  },
  {
    image:
      'https://blog.wele-learn.com/wp-content/uploads/2024/10/1def5f9b-b235-4498-8192-b90545772b33.jpeg',
    title: 'WELE là người bạn tuyệt vời của giáo viên',
    published_at: '03/10/2024',
    author_name: 'Le Trung Hieu',
    description:
      'WELE đang làm việc trực tiếp với các giáo viên để tạo ra bộ công cụ rất thuận lợi cho việc tạo bài nghe cũng như quản lý các học sinh trong lớp.',
    link: 'https://blog.wele-learn.com/wele-la-nguoi-ban-tuyet-voi-cua-giao-vien/',
  },
];

export default function Page() {
  return (
    <div className="flex flex-col gap-12">
      <PlansPage />
      <Blogs posts={BlogList} />
    </div>
  );
}
