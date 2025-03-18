import { ReceiptPercentIcon } from '@heroicons/react/16/solid';
import { StarIcon } from '@heroicons/react/24/solid';

import LogEvent from '@/packages/firebase/LogEvent';
import { MeHook } from '@/store/me/hooks';

export type AdsBookItem = {
  image: string;
  title: string;
  description?: string;
  link: string;
  couponCode: string;
  saleOff: number; // percent
  source: string;
  rating?: string;
  price: number;
  sold?: number;
};

export type AdsBookProps = {
  data: AdsBookItem[];
};

export function AdsBook({ data }: AdsBookProps) {
  const me = MeHook.useMe();

  const onClick = (item: AdsBookItem) => {
    LogEvent.sendEvent('click.ad', {
      type: 'ads',
      name: 'ad_book',
      page: 'podcast_listen_submit',
      title: item.title,
      user: me?.id,
      link: item.link,
    });
  };

  const currencyFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  return (
    <div>
      <h3 className="text-base text-gray-700">Ưu đãi từ Fillform</h3>
      <p className="text-xs text-gray-500 mb-6">
        (Nhập mã giảm giá của Fillform để nhận ưu đãi bạn nhé)
      </p>
      <div className="flex flex-wrap gap-6">
        {data.map((item) => (
          <a
            target="_blank"
            href={item.link}
            key={item.link}
            onClick={() => onClick(item)}
            className="group flex flex-col w-[214px] p-2 border border-gray-200 rounded-lg hover:shadow-sm"
          >
            <div
              className="bg-contain bg-center bg-no-repeat w-full h-[214px] mb-4"
              style={{ backgroundImage: `url(${item.image})` }}
            />

            <div className="px-2 pb-2">
              <h4 className="text-sm text-gray-900 font-medium mb-3">
                {item.title}
              </h4>

              <div className="flex gap-2 items-center text-sm text-gray-500 mb-3">
                <span className="flex gap-1 items-center">
                  <span>{item.rating}</span>
                  <StarIcon className="w-4 h-4 text-yellow-400 mb-[2px]" />
                </span>

                <span>{item.sold} đã bán</span>

                <span className="text-blue-500">{item.source}</span>
              </div>

              <div className="flex items-end gap-1 mb-3">
                <h4 className="flex items-center gap-4 text-lg font-medium">
                  {currencyFormat.format(item.price * (1 - item.saleOff / 100))}
                </h4>

                <span>/</span>

                <span className="text-sm text-gray-500 line-through mb-[1px]">
                  {currencyFormat.format(item.price)}
                </span>
              </div>

              <div className="text-primary bg-red-50 inline-flex items-center gap-1 rounded-md py-1 px-2">
                <ReceiptPercentIcon className="w-[18px] h-[18px]" />

                <span className="text-sm font-medium">{item.couponCode}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
