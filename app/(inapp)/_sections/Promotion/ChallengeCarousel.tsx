'use client';

import { shuffle } from 'lodash';
import { useMemo } from 'react';
import Slider from 'react-slick';

import { useChallenges } from '@/app/(inapp)/challenges/challengeHook';
import { Challenge } from '@/app/(inapp)/home/_sections/Promotion/Challenge';

const settings = {
  dots: true,
  infinite: true,
  speed: 500,
  autoplay: true,
  autoplaySpeed: 5000,
  slidesToShow: 1,
  slidesToScroll: 1,
  dotsClass: 'slick-dots',
  pauseOnHover: true,
};

export default function ChallengeCarousel() {
  const { data } = useChallenges();

  const challenges = useMemo(() => {
    if (!Array.isArray(data)) {
      return null;
    }

    const inProgressList = data.filter(
      (item) => item.metatype !== 'FINISHED_STATUS'
    );

    return shuffle(inProgressList);
  }, [data]);

  if (!challenges?.length) {
    return null;
  }

  if (challenges.length === 1) {
    return <Challenge challenge={challenges[0]} />;
  }

  return (
    //@ts-ignore
    <Slider {...settings}>
      {challenges.map((item) => (
        <Challenge challenge={item} key={item.id} />
      ))}
    </Slider>
  );
}
