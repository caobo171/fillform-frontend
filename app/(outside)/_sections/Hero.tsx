'use client';

import { motion } from 'framer-motion';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import {
  Caption,
  Heading,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { Container } from '@/components/layout/container/container';

export function Hero() {
  return (
    <section className="pt-[182px] pb-[80px] bg-mesh-gradient bg-cover bg-center relative">
      <Container className="text-center">
        <Caption className="mb-6">We Enjoy Learning English</Caption>

        <div className="mb-6 relative">
          <Heading className="relative z-2">
            Nghe chép chính tả
            <br />
            Lan tỏa niềm vui
          </Heading>

          <img
            className="hidden absolute top-[48px] left-[316px] z-1 shake-y-slow md:inline-block"
            src="/static/landing/brush/nghe_chep.svg"
            alt="brush"
          />
        </div>

        <TextBodyLarge className="mb-12">
          Chương trình tiếng Anh MIỄN PHÍ đã giúp hơn 10,000 bạn trẻ chinh phục
          kỹ năng nghe.
          <br />
          Nếu bạn ước mong có một ngày có thể nghe tiếng Anh như một niềm vui,
          đây là chương trình dành cho bạn.
        </TextBodyLarge>

        <div className="flex flex-col gap-4 justify-center items-center mb-12 md:flex-row">
          <a href="https://app.wele-learn.com/home">
            <ButtonGradient type="solid" className="w-[300px] md:w-auto">
              Khám phá app
            </ButtonGradient>
          </a>

          <a
            href="https://app.wele-learn.com/authentication/register"
            target="_blank"
            className="md:hidden"
          >
            <ButtonGradient type="outlined" className="w-[300px]">
              Đăng kí tài khoản
            </ButtonGradient>
          </a>

          <a
            href="https://www.youtube.com/watch?v=u5DfkP-ll3M"
            target="_blank"
            className="hidden md:inline-block"
          >
            <ButtonGradient type="outlined">Xem hướng dẫn</ButtonGradient>
          </a>
        </div>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="w-full hidden lg:block"
        >
          <div>
            <script async src="https://js.storylane.io/js/v2/storylane.js" />
            <div
              className="sl-embed"
              style={{
                position: 'relative',
                paddingBottom: 'calc(49.22% + 25px)',
                width: '100%',
                height: 0,
                transform: 'scale(1)',
              }}
            >
              <iframe
                title="wele"
                loading="lazy"
                className="sl-demo"
                src="https://app.storylane.io/demo/rbag0acwbush?embed=inline"
                name="sl-embed"
                allow="fullscreen"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  borderRadius: '10px',
                  boxSizing: 'border-box',
                  border: '1px solid rgba(63,95,172,0.35)',
                  boxShadow: '0px 0px 18px rgba(26, 19, 72, 0.15)',
                }}
              />
            </div>
          </div>
        </motion.div>
      </Container>

      <div className="hidden md:block flying-box">
        <span className="absolute w-[10px] h-[10px] left-[4%] top-[30%] rounded-full bg-yellow-400 flying-6s" />
        <span className="absolute w-[20px] h-[20px] left-[12%] top-[35%] rounded-full bg-purple-500 flying-8s" />
        <span className="absolute w-[18px] h-[18px] left-[16%] top-[20%] rounded-full bg-green-500 flying-10s" />
        <span className="absolute w-[10px] h-[10px] left-[20%] top-[12%] rounded-full bg-rose-500 flying-9s" />

        <span className="absolute w-[34px] h-[34px] right-[10%] top-[12%] rounded-full bg-rose-500 flying-6s" />
        <span className="absolute w-[10px] h-[10px] right-[8%] top-[25%] rounded-full bg-yellow-400 flying-7s" />
        <span className="absolute w-[20px] h-[20px] right-[12%] top-[32%] rounded-full bg-purple-500 flying-11s" />
        <span className="absolute w-[6px] h-[6px] right-[20%] top-[28%] rounded-full bg-green-500 flying-9s" />
      </div>
    </section>
  );
}
