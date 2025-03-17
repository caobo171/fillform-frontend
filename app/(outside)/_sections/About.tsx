'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import {
  HeadingH2,
  TextBody,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';
import { Helper } from '@/services/Helper';

export function About() {
  // const isMobile = useMemo(() => Helper.isMobileDevice(), []);

  const isMobile = false;
  return (
    <section id="about" className="py-[120px]">
      <Container>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <motion.div
            {...(isMobile ? motionAnimation.showUp : motionAnimation.toRight)}
            className="lg:w-7/12"
          >
            <img
              src="/static/landing/about_us.svg"
              alt="about"
              className="w-full h-auto rounded-lg"
            />
          </motion.div>

          <motion.div
            {...(isMobile ? motionAnimation.showUp : motionAnimation.toLeft)}
            className="text-center lg:text-left lg:w-5/12"
          >
            <HeadingH2 className="mb-2">Về chúng mình</HeadingH2>

            <TextBodyLarge className="mb-8">
              WELE - We Enjoy Learning English
            </TextBodyLarge>

            <TextBody className="mb-4 text-justify">
              Chương trình We Enjoy Learning English là một online platform
              luyện nghe tiếng Anh bằng phương pháp nghe chép chính tả, được
              thiết kế dành riêng cho người Việt, đặc biệt phù hợp cho các sinh
              viên và những người đang tự học tiếng Anh. Với sứ mệnh giúp người
              Việt nâng cao khả năng giao tiếp ngoại ngữ, chương trình là công
              cụ hỗ trợ luyện nghe hiệu quả cho các kỳ thi IELTS, TOEIC,... Đặc
              biệt, chương trình hoàn toàn miễn phí và đã hoạt động trong suốt
              10 năm qua.
            </TextBody>

            <TextBody className="mb-8 text-justify">
              Chương trình đã giúp đỡ hơn 10,000 học viên nâng cao kỹ năng nghe,
              nhận được hơn 200,000 bài nghe chép chính tả và nhận về vô số lời
              cảm ơn từ cộng đồng tự học tiếng Anh và các thí sinh luyện thi
              IELTS, TOEIC.
            </TextBody>

            <a
              href="https://letrunghieuo8.wordpress.com/wele/"
              target="_blank"
              className="inline-block"
            >
              <ButtonGradient type="solid">Tìm hiểu thêm</ButtonGradient>
            </a>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}
