'use client';

import { useEffect, useState } from 'react';
import { useLocalStorage } from 'react-use';

import Constants from '@/core/Constants';

/* eslint-disable */
function getAverageRGB(imgEl: HTMLImageElement) {
  const blockSize = 5; // only visit every 5 pixels
  const defaultRGB = { r: 0, g: 0, b: 0 }; // for non-supporting envs
  const canvas = document.createElement('canvas');
  const context = canvas.getContext && canvas.getContext('2d');

  let data;
  let width;
  let height;
  let i = -4;
  let length;

  const rgb = { r: 0, g: 0, b: 0 };

  let count = 0;

  if (!context) {
    return defaultRGB;
  }

  height = canvas.height =
    imgEl.naturalHeight || imgEl.offsetHeight || imgEl.height;
  width = canvas.width = imgEl.naturalWidth || imgEl.offsetWidth || imgEl.width;

  context.drawImage(imgEl, 0, 0);

  try {
    data = context.getImageData(0, 0, width, height);
  } catch (e) {
    /* security error, img on diff domain */
    return defaultRGB;
  }

  length = data.data.length;

  while ((i += blockSize * 4) < length) {
    ++count;
    rgb.r += data.data[i];
    rgb.g += data.data[i + 1];
    rgb.b += data.data[i + 2];
  }

  // ~~ used to floor values
  rgb.r = ~~(rgb.r / count);
  rgb.g = ~~(rgb.g / count);
  rgb.b = ~~(rgb.b / count);

  return rgb;
}

function getLuma([r, g, b]: number[]) {
  return 0.2126 * (r / 255) + 0.7152 * (g / 255) + 0.0722 * (b / 255);
}
/* eslint-enable */

type ChallengeStorageItem = {
  src: string;
  luma: number;
  rbg: number[];
};

export function useImageColor(img: string, id: string) {
  const [storageData, setStorageData] = useLocalStorage<{
    [key: string]: ChallengeStorageItem;
  }>('challenge-home');

  let data: ChallengeStorageItem = {
    src: '',
    luma: 0.5,
    rbg: [223, 109, 113],
  };

  if (storageData && id in storageData) {
    data = storageData[id];
  }

  const [rgb, setRgb] = useState<number[]>(data.rbg);

  const [luma, setLuma] = useState<number>(data.luma);

  useEffect(() => {
    // reset the color for every new image
    setRgb(data.rbg);
    setLuma(data.luma);
  }, [data.luma, data.rbg.join(',')]);

  useEffect(() => {
    if (!img || data?.src === img) {
      return;
    }

    const image = new Image();

    image.src = `${Constants.IMAGE_URL}${img}`;

    image.crossOrigin = 'anonymous';

    image.addEventListener('load', () => {
      const rgbValues = Object.values(getAverageRGB(image));

      const lumaValue = getLuma(rgbValues);

      setRgb(rgbValues);

      setLuma(lumaValue);

      const newData = {
        ...storageData,
        [id]: { src: img, luma: lumaValue, rbg: rgbValues },
      };

      setStorageData(newData);
    });
  }, [data?.src, id, img, setStorageData, storageData]);

  return {
    rgb,
    luma,
  };
}
