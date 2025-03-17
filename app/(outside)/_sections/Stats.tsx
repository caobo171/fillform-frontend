'use client';

import { motion } from 'framer-motion';
import { CSSProperties, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';

import {
  HeadingH2,
  HeadingH3,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';
import useBoard from '@/store/home/useBoard';

const box = {
  hidden: { opacity: 1, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.2,
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

type StatBoxProps = {
  label: string;
  value: string;
  className?: string;
  style?: CSSProperties;
};

function StatBox({ label, value, className, style }: StatBoxProps) {
  return (
    <motion.div
      variants={item}
      transition={{ duration: 0.5 }}
      className={twMerge(
        'w-full sm:w-[calc(50%-12px)] md:w-[248px] h-[140px] flex flex-col gap-2 items-center justify-center rounded-lg',
        className
      )}
      style={style}
    >
      <HeadingH3>{value}</HeadingH3>
      <TextBodyLarge>{label}</TextBodyLarge>
    </motion.div>
  );
}

export function Stats() {
  const { monthBoard, setMonthBoard, getMonthBoard } = useBoard();

  const callGetMonthBoard = async (now: Date) => {
    localStorage.setItem(
      'nextMonday',
      now.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7 || 7)).toString()
    );

    return getMonthBoard();
  };

  useEffect(() => {
    const localNextMonday = localStorage.getItem('nextMonday') || 0;
    if (!localNextMonday) {
      const now = new Date();
      callGetMonthBoard(now).then((r) => r);
    } else {
      const now = new Date();
      const localMonthBoard = JSON.parse(
        localStorage.getItem('monthBoard') || '{}'
      );

      if (
        now.getTime() > Number(localNextMonday) ||
        Object.keys(localMonthBoard).length <= 0
      ) {
        callGetMonthBoard(now).then((r) => r);
      } else if (Object.keys(localMonthBoard).length > 0) {
        setMonthBoard(localMonthBoard);
      }
    }
  }, []);

  useEffect(() => {
    if (Object.keys(monthBoard).length > 0) {
      localStorage.setItem('monthBoard', JSON.stringify(monthBoard));
    }
  }, [monthBoard]);

  return (
    <section className="py-[120px]">
      <Container className="relative">
        <img
          src="/static/landing/dot_grid.svg"
          className="absolute z-1 top-0 left-6"
          alt="grid"
        />

        <img
          src="/static/landing/dot_grid.svg"
          className="absolute z-1 bottom-[-40px] right-6"
          alt="grid"
        />

        <div className="relative z-2 mb-14">
          <motion.div {...motionAnimation.showUp}>
            <HeadingH2 className="relative text-center z-2">
              Chúng ta đã đạt được <br className="hidden md:block" />
              trong tháng vừa qua
            </HeadingH2>
          </motion.div>

          <img
            src="/static/landing/brush/thang_vua_qua.svg"
            alt="brush"
            className="absolute z-1 bottom-[-16px] left-[calc(50%-88px)] hidden md:inline-block"
          />
        </div>

        <motion.div
          variants={box}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-center gap-6 relative z-2 flex-wrap md:flex-nowrap"
        >
          <StatBox
            label="Giờ nghe"
            value={`${monthBoard.month_time}+`}
            className="bg-green-50"
            style={{ boxShadow: '0px 2px 0px 0px hsla(152, 81%, 86%, 1)' }}
          />

          <StatBox
            label="Lượt nghe"
            value={`${monthBoard.month_listens}+`}
            className="bg-pink-50"
            style={{ boxShadow: '0px 2px 0px 0px hsla(327, 73%, 87%, 1)' }}
          />

          <StatBox
            label="Người dùng"
            value={`${monthBoard.month_active_users}+`}
            className="bg-yellow-50"
            style={{ boxShadow: '0px 2px 0px 0px hsla(48, 100%, 86%, 1)' }}
          />

          <StatBox
            label="Bài nộp"
            value={`${monthBoard.month_submits}+`}
            className="bg-indigo-50"
            style={{ boxShadow: '0px 2px 0px 0px hsla(226, 100%, 87%, 1)' }}
          />
        </motion.div>
      </Container>
    </section>
  );
}
