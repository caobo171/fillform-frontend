'use client';

import { shuffle } from 'lodash';
import { useEffect, useMemo } from 'react';
import Slider from 'react-slick';

import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';

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

const AdList = [
  {
    img: '/static/ads/elsa.jpg',
    link: 'https://vn.elsaspeak.com/affiliates-vnaff_no/?ref=1431',
    name: 'elsa',
  },
  {
    img: '/static/ads/AI-hay.jpg',
    link: 'https://ai-hay.vn/ask?utm_source=wele&utm_medium=banner&utm_campaign=wele_banner_nov',
    name: 'ai-hay',
  },
];

export default function AdsCarousel() {
  const me = MeHook.useMe();

  const shuffleList = useMemo(() => shuffle(AdList), []);

  useEffect(() => {
    LogEvent.sendEvent('show.ad', {
      type: 'ads',
      name: 'ad_carousel',
      user: me?.id,
    });
  }, [me?.id]);

  return (
    <div>
      {/**@ts-ignored */}
      <Slider {...settings}>
        {shuffleList.map((ad) => (
          <a
            key={ad.name}
            href={ad.link}
            target="_blank"
            className="rounded-lg overflow-hidden w-[800px] h-[200px]"
            onClick={() =>
              LogEvent.sendEvent('click.ad', {
                type: 'ad',
                name: ad.name,
                user: me?.id,
                link: ad.link,
              })
            }
          >
            <img src={ad.img} alt={ad.name} className="w-full h-full" />
          </a>
        ))}
      </Slider>
    </div>
  );
}
