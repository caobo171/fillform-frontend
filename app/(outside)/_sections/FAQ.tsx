'use client';

import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import {
  HeadingH2,
  HeadingH4,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Accordion } from '@/components/common';
import { Container } from '@/components/layout/container/container';

const answerClass = 'mt-3 lg:px-7';

const items = [
  {
    title: <HeadingH4>1. Chương trình WELE có miễn phí hay không?</HeadingH4>,
    content: (
      <TextBodyLarge className={answerClass}>
        Chương trình WELE hoàn toàn miễn phí khi học trên website{' '}
        <a href="http://www.wele-learn.com" className="text-primary">
          WELE
        </a>
        . Nếu bạn muốn sử dụng mobile app cũng như một số tính năng ưu việt cho
        premium user để đẩy nhanh thời gian luyện nghe, bạn có thể mua gói
        premium package với giá chỉ có 220.000 VND/năm.
      </TextBodyLarge>
    ),
  },
  {
    title: <HeadingH4>2. Trình độ nghe của mình còn yếu, nên bắt đầu từ đâu?</HeadingH4>,
    content: (
      <TextBodyLarge className={answerClass}>
        Chương trình có chia sẻ lộ trình cho các bạn mới luyện nghe tại <a href="https://blog.wele-learn.com/lo-trinh-cho-cac-ban-moi-luyen-nghe/" className="text-primary" target="_blank">WELE Blog</a>.
        Cách đây 1 tháng, chương trình có tạo thử thách với lộ trình này, bạn có thể tham gia cùng với hơn 1000 bạn đã đăng ký thử thách.
      </TextBodyLarge>
    ),
  },
  {
    title: <HeadingH4>3. WELE có hiệu quả hay không?</HeadingH4>,
    content: (
      <TextBodyLarge className={answerClass}>
        WELE đã hoạt động từ 2014 và giúp hơn 10,000 bạn trẻ trong việc nâng cao
        trình độ tiếng Anh, bạn có thể đọc chia sẻ của các thành viên tại <a href="https://blog.wele-learn.com/category/review/" className="text-primary" target="_blank">WELE Blog</a>.
      </TextBodyLarge>
    ),
  },
  {
    title: (
      <HeadingH4>4. Mình có thể liên lạc với WELE bằng cách nào?</HeadingH4>
    ),
    content: (
      <TextBodyLarge className={answerClass}>
        Bạn có thể liên lạc với fanpage để nói chuyện với các admins, hoặc bạn
        có thể vào facebook group chat{' '}
        <a
          href="https://www.facebook.com/messages/t/9364643033552106"
          target="_blank"
          className="text-primary"
        >
          WELE Learn
        </a>{' '}
        hoặc zalo group để nhận hỗ trợ từ cộng đồng WELE members.
      </TextBodyLarge>
    ),
  },
  {
    title: (
      <HeadingH4>5. Mình có thể tham gia các lớp học bằng cách nào?</HeadingH4>
    ),
    content: (
      <TextBodyLarge className={answerClass}>
        WELE có các lớp học chung cho cả cộng đồng và các lớp học riêng của từng
        giáo viên. Các bạn có thể tham gia các lớp học chung bằng cách truy cập <a href="https://app.wele-learn.com/classes" className="text-primary" target="_blank">WELE Classes</a>.
        Với các lớp học riêng, giáo viên sẽ gửi bạn đường link để bạn tham gia.
      </TextBodyLarge>
    ),
  },


];

export function FAQ() {
  return (
    <section className="pt-[120px]" id="faq">
      <Container>
        <motion.div
          {...motionAnimation.showUp}
          className="w-full flex flex-col justify-center items-center mb-10"
        >
          <HeadingH2 className="mb-4 text-center">Câu hỏi thường gặp</HeadingH2>

          <TextBodyLarge className="mb-6">
            Đừng ngần ngại đặt câu hỏi cho WELE bạn nhé
          </TextBodyLarge>

          <a href="https://www.facebook.com/welevn/" target="_blank">
            <ButtonGradient type="solid" className="gap-2">
              <ChatBubbleOvalLeftIcon className="w-6 h-6 text-white" />
              Chat với WELE
            </ButtonGradient>
          </a>
        </motion.div>

        <motion.div
          {...motionAnimation.showUp}
          className="bg-mesh-gradient p-6 lg:p-10 rounded-lg"
        >
          <Accordion items={items} className="-mt-[64px]" />
        </motion.div>
      </Container>
    </section>
  );
}
