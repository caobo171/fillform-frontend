'use client';

import { motion } from 'framer-motion';

import { HeadingH2 } from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';

const PartnerList = [
  {
    name: 'G-College',
    link: 'https://www.gcollege.org/',
    logo: '/static/landing/partner/g_college.png',
  },
  {
    name: 'Học bổng đồng hành',
    link: 'https://donghanh.net/en/home-page-en/',
    logo: '/static/landing/partner/hbdh.png',
  },
  {
    name: 'Cấy nền ngoại ngữ',
    link: 'https://caynen.vn/cay-nen-ngoai-ngu/',
    logo: '/static/landing/partner/cay_nen.png',
  },
  {
    name: 'KisStartup',
    link: 'https://www.kisstartup.com/',
    logo: '/static/landing/partner/kisstartup.png',
  },
];

export function Partner() {
  return (
    <section className="pt-[120px]">
      <Container>
        <motion.div {...motionAnimation.showUp}>
          <div className="pt-10 pb-14 rounded-lg flex flex-col items-center gap-10 bg-orange-50">
            <HeadingH2 className="text-center">Đối tác của WELE</HeadingH2>

            <div className="flex flex-col gap-4 md:flex-row md:gap-10">
              {PartnerList.map((item) => (
                <a key={item.name} href={item.link} target="_blank">
                  <img
                    src={item.logo}
                    alt={item.name}
                    className="h-[124px] w-auto"
                  />
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="mt-[120px] text-center flex justify-center">
          <img src="/static/landing/brush/tinh_nang.svg" alt="" />
        </div>
      </Container>
    </section>
  );
}
