import { Nunito_Sans } from 'next/font/google';

export const nunitoSans = Nunito_Sans({ subsets: ['vietnamese'] });



export const motionAnimation = {
  toRight: {
    initial: { x: -80, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  },
  toLeft: {
    initial: { x: 80, opacity: 0 },
    whileInView: { x: 0, opacity: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  },
  showUp: {
    initial: { y: 40, opacity: 0 },
    whileInView: { y: 0, opacity: 1 },
    transition: { duration: 0.5 },
    viewport: { once: true },
  },
};
