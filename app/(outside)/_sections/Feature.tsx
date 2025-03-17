'use client';

import {
  BookOpenIcon,
  ChartPieIcon,
  ChevronRightIcon,
  ListBulletIcon,
  UsersIcon,
} from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  HeadingH2,
  HeadingH3,
  TextBodyHighLight,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';

type FeatureBoxProps = {
  icon: ReactNode;
  title: string;
  description: string;
  imageUrl: string;
  colorIconBox: string;
  colorBgBox: string;
  colorLink: string;
  className?: string;
};

function FeatureBox({
  icon,
  title,
  description,
  imageUrl,
  colorIconBox,
  colorBgBox,
  colorLink,
  className,
}: FeatureBoxProps) {
  return (
    <motion.div
      {...motionAnimation.showUp}
      className={twMerge(
        'rounded-[24px] flex flex-col gap-8 w-full overflow-hidden',
        colorBgBox,
        className
      )}
    >
      <div className="flex-1 flex flex-col gap-8 pt-10 px-10">
        <div
          className={twMerge(
            'h-14 w-14 rounded-full flex items-center justify-center text-white',
            colorIconBox
          )}
        >
          {icon}
        </div>

        <div className="flex flex-col gap-4">
          <HeadingH3>{title}</HeadingH3>

          <TextBodyLarge className="flex-1">{description}</TextBodyLarge>
        </div>

        <TextBodyHighLight className={colorLink}>
          <a
            href="https://app.wele-learn.com"
            className="inline-flex items-center gap-2"
          >
            Khám phá thêm <ChevronRightIcon className="w-4 h-4" />
          </a>
        </TextBodyHighLight>
      </div>

      <div className="h-[296px] ml-10 overflow-hidden">
        <img
          src={imageUrl}
          alt="img"
          className="w-auto h-auto rounded-tl-[24px]"
        />
      </div>
    </motion.div>
  );
}

export function Feature() {
  return (
    <section id="features" className="py-[120px] bg-gray-50">
      <Container>
        <motion.div {...motionAnimation.showUp} className="relative mb-20">
          <HeadingH2 className="relative z-2 text-center">
            Tính năng xịn xò, giúp các bạn <br className="hidden md:block" />
            tiến bộ nhanh chóng
          </HeadingH2>

          <img
            src="/static/landing/brush/tinh_nang.svg"
            alt="brush"
            className="absolute z-1 left-[282px] top-[24px] hidden md:inline-block"
          />
        </motion.div>

        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <FeatureBox
            icon={<BookOpenIcon className="w-6 h-6" />}
            title="Công cụ nghe chép tối ưu"
            description="Người nghe mới dễ dàng bị lạc đường, không biết mình đang nghe tới đâu. Những bài nghe của WELE sẽ luôn có các từ gợi ý dẫn lối cho bạn. Không chỉ thế, bạn còn nhận được kết quả ngay lập tức sau khi nộp bài nghe."
            imageUrl="/static/landing/feature/tool.png"
            colorIconBox="bg-orange-400"
            colorBgBox="bg-orange-50"
            colorLink="text-orange-500"
          />

          <FeatureBox
            icon={<ChartPieIcon className="w-6 h-6" />}
            title="Hệ thống phân tích kết quả"
            description="Nhằm mục đích đưa ra lộ trình phù hợp cho từng bạn, giúp các bạn đi đúng và nhanh hơn. WELE có 1 hệ thống phân tích và đánh giá kết quả học tập, nhờ vào đó bạn nắm được những điểm yếu, điểm mạnh của mình để cải thiện."
            imageUrl="/static/landing/feature/analyze.png"
            colorIconBox="bg-lime-500"
            colorBgBox="bg-lime-50"
            colorLink="text-lime-600"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <FeatureBox
            icon={<UsersIcon className="w-6 h-6" />}
            title="Các lớp học bổ ích"
            description="WELE có rất nhiều lớp học được tạo ra từ nhiều giáo viên ở các trường học, trung tâm, hay từ các bạn có trình độ tiếng anh cao. Bạn sẽ không cô đơn trên con đường tu luyện của mình khi luôn có những người bạn đồng hành."
            imageUrl="/static/landing/feature/class.png"
            colorIconBox="bg-sky-500"
            colorBgBox="bg-sky-50"
            colorLink="text-sky-600"
          />

          <FeatureBox
            icon={<ListBulletIcon className="w-6 h-6" />}
            title="Và rất nhiều tính năng khác"
            description="WELE còn rất nhiều những tính năng hay ho khác, bổ trợ các bạn trong quá trình rèn luyện như: WELE Challenges, Hệ thống điểm thưởng, Hệ thống WELE Coins..."
            imageUrl="/static/landing/feature/more.png"
            colorIconBox="bg-violet-500"
            colorBgBox="bg-violet-50"
            colorLink="text-violet-600"
          />
        </div>
      </Container>
    </section>
  );
}
