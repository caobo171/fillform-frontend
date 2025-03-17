'use client';

import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

import { HeadingH2, HeadingH4 } from '@/app/(outside)/_components/Typography';
import { Container } from '@/components/layout/container/container';

const box = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { x: 20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
};

type SourceBoxProps = {
  label: string;
  link: string;
  className?: string;
  shadowColor?: string;
};

function SourceBox({ label, className, shadowColor, link }: SourceBoxProps) {
  return (
    <motion.div variants={item} transition={{ duration: 0.3 }}>
      <motion.a
        href={link}
        className={twMerge(
          'inline-flex flex-col gap-2 items-center justify-center rounded-lg px-6 py-4 whitespace-nowrap',
          className
        )}
        style={{ boxShadow: `0px 8px 0px 0px ${shadowColor}` }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <HeadingH4 className="text-white">{label}</HeadingH4>
      </motion.a>
    </motion.div>
  );
}

export function Source() {
  return (
    <section className="py-[120px] bg-mesh-gradient bg-cover bg-top">
      <Container className="flex-col-reverse flex gap-20 justify-between items-center xl:flex-row xl:items-start">
        <motion.div
          variants={box}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.3 }}
          className="w-full flex flex-col relative items-center gap-6 md:gap-20"
        >
          <SourceBox
            label="6 Minutes English"
            className="bg-cyan-600"
            shadowColor="hsla(192, 91%, 26%, 1)"
            link="https://app.wele-learn.com/podcasts?source_keys=3&page=1"
          />

          <div className="relative flex flex-col md:flex-row gap-6 md:gap-20">
            <SourceBox
              label="Spotlight English"
              className="bg-lime-600"
              shadowColor="hsla(85, 85%, 25%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=2"
            />

            <SourceBox
              label="English At Work"
              className="bg-violet-600"
              shadowColor="hsla(262, 83%, 48%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=1"
            />

            <SourceBox
              label="Real English"
              className="bg-pink-600"
              shadowColor="hsla(333, 71%, 40%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=11"
            />
          </div>

          <div className="relative flex flex-col md:flex-row gap-6 md:gap-[100px]">
            <SourceBox
              label="IELTS"
              className="bg-yellow-500"
              shadowColor="hsla(38, 92%, 40%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=4"
            />

            <SourceBox
              label="TED"
              className="bg-red-600"
              shadowColor="hsla(0, 72%, 41%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=8"
            />

            <SourceBox
              label="TOEIC"
              className="bg-blue-600"
              shadowColor="hsla(221, 83%, 43%, 1)"
              link="https://app.wele-learn.com/podcasts?page=1&source_keys=9"
            />
          </div>

          <SourceBox
            label="and MORE..."
            className="bg-gray-900"
            shadowColor="hsla(0, 0%, 35%, 1)"
            link="https://app.wele-learn.com/podcasts?page=1"
          />
        </motion.div>

        <div className="relative">
          <HeadingH2 className="mt-20 relative z-2 text-center xl:text-left">
            Nguồn nghe
            <br />
            phong phú, đa dạng
          </HeadingH2>

          <img
            src="/static/landing/brush/phong_phu.svg"
            alt="brush"
            className="absolute z-1 bottom-[40px] hidden xl:inline-block"
          />
        </div>
      </Container>
    </section>
  );
}
