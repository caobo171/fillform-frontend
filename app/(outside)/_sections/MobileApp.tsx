'use client';

import { CheckBadgeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import {
  HeadingH2,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';

const CheckList = [
  'Tính năng playlist, dễ dàng phân loại bài nghe yêu thích',
  'Nghe chép chính tả trực tiếp trên điện thoại',
  'Nghe những bài podcast tiếng Anh khi chạy bộ hoặc làm việc nhà ',
];

export function MobileApp() {
  // const isMobile = useMemo(() => Helper.isMobileDevice(), []);

  const isMobile = false;
  return (
    <section className="py-[80px]">
      <Container className="flex flex-col md:flex-row gap-10 justify-between items-center">
        <motion.div
          {...(isMobile ? motionAnimation.showUp : motionAnimation.toRight)}
          className="w-full"
        >
          <div className="relative">
            <HeadingH2 className="relative z-2 mb-6">
              Nghe mọi lúc mọi nơi
              <br />
              với Mobile App
            </HeadingH2>

            <img
              src="/static/landing/brush/mobile_app.svg"
              alt="brush"
              className="absolute z-1 left-[80px] bottom-[-16px] hidden md:inline-block"
            />
          </div>

          <div className="flex flex-col gap-4 mb-12">
            {CheckList.map((val: string) => (
              <TextBodyLarge key={val} className="flex items-center gap-3">
                <CheckBadgeIcon className="w-6 h-6 text-primary" />
                {val}
              </TextBodyLarge>
            ))}
          </div>

          <div className="flex gap-x-4">
            <a
              href="https://play.google.com/store/apps/details?id=com.welelearnapp"
              target="_blank"
            >
              <img
                src="/static/google-play.png"
                alt="google play"
                className="h-12 w-auto"
              />
            </a>

            <a
              href="https://apps.apple.com/vn/app/wele-learn/id6449467539"
              target="_blank"
            >
              <img
                src="/static/app-store.png"
                alt="apple store"
                className="h-12 w-auto"
              />
            </a>
          </div>
        </motion.div>

        <motion.div
          {...(isMobile ? motionAnimation.showUp : motionAnimation.toLeft)}
          className="w-full"
        >
          <img
            src="/static/landing/mobile_app.svg"
            alt="mobile app"
            className="w-full h-auto rounded-lg"
          />
        </motion.div>
      </Container>
    </section>
  );
}
