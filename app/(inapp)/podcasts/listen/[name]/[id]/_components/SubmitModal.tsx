import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AdsBook, AdsBookItem } from '@/app/(inapp)/_components/Ads';
import { Button, Modal, ModalProps } from '@/components/common';
import { Code } from '@/core/Constants';
import Cookie from '@/lib/core/fetch/Cookie';
import { Podcast } from '@/modules/podcast/podcast';
import LogEvent from '@/packages/firebase/LogEvent';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawPodcast } from '@/store/types';

const Ads: AdsBookItem[] = [
  {
    title: 'Gom Lỗi Nhặt Lầm - 365 ngày yêu tiếng Anh',
    image:
      'https://salt.tikicdn.com/cache/750x750/ts/product/3b/5e/b2/1210a1d9524ff483e36ffd083bbed96b.png.webp',
    couponCode: 'WELELEARN5',
    link: 'https://tiki.vn/gom-loi-nhat-lam-365-ngay-yeu-tieng-anh-p168881355.html?fbclid=IwY2xjawGV2hRleHRuA2FlbQIxMAABHYwskclc9mvVPHesSDChgZyq5UUyKqfxPg9B4IhAB5gs0uJxZ9i9fFxL4Q_aem_dJsWwkU-M9nKY9jQbg6w5g',
    saleOff: 5,
    source: 'tiki.vn',
    rating: '5.0',
    price: 193000,
    sold: 139,
  },
];

function AIHayAd() {
  const me = MeHook.useMe();

  const onClick = () => {
    LogEvent.sendEvent('click.ad', {
      type: 'ads',
      name: 'ai-hay',
      page: 'podcast_listen_submit',
      user: me?.id,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <a
        target="_blank"
        onClick={onClick}
        href="https://ai-hay.vn/ask?utm_source=wele&utm_medium=banner&utm_campaign=wele_banner_nov"
      >
        <img
          src="/static/ads/AI-hay.jpg"
          alt="ai-hay"
          className="w-full h-auto rounded-lg"
        />
      </a>
    </div>
  );
}

enum Status {
  None = 'none',
  Submitting = 'submitting',
  Checking = 'checking',
  Generating = 'generating',
  Success = 'success',
  Error = 'error',
}

function getRandomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const justANumber = getRandomNumber(1, 10);

type Props = {
  podcast: RawPodcast;
  onSubmit: () => Promise<AnyObject | null>;
} & ModalProps;

export function SubmitModal({
  podcast,
  onCancel,
  onSubmit,
  ...otherProps
}: Props) {
  const router = useRouter();

  const sub = MeHook.useSubscription();

  const isPremium = Helper.isPremiumUser(sub);

  const [status, setStatus] = useState<Status>(Status.None);

  // Don't know why but the time to redirect to result page/detail page is too long
  // Let's make a loading state to make users feel better
  const [redirecting, setRedirecting] = useState(false);

  const handleSubmit = async () => {
    if (!onSubmit) {
      return;
    }

    setStatus(Status.Submitting);

    try {
      // the process is actually done after this onOk function fulfilled,
      // but we want to show some ads, so we keep this modal last for 10 - 20s
      // by showing some fake process
      const res: AnyObject | null = await onSubmit();

      if (res?.data?.code !== Code.SUCCESS) {
        setStatus(Status.Error);
        return;
      }

      // time range
      // 5 - 10s for Freemium user
      // 3 - 5s for Premium user
      const range = isPremium ? [3000, 5000] : [5000, 10000];

      // keep this status in a few seconds
      // set it random to make it more realistic
      setStatus(Status.Checking);

      // generate time to render next screen
      const time1 = getRandomNumber(range[0], range[1]);

      // keep this status in a few seconds
      // set it random to make it more realistic
      // -> this will keep Status.Checking alive for a few seconds
      setTimeout(() => setStatus(Status.Generating), time1);

      // generate time to render next screen
      const time2 = getRandomNumber(range[0], range[1]);

      // -> this will keep Status.Generating alive for a few seconds
      setTimeout(() => setStatus(Status.Success), time1 + time2);

      // handle something for mobile
      // eslint-disable-next-line
      // @ts-ignore
      if (window.ReactNativeWebView) {
        // eslint-disable-next-line
        // @ts-ignore
        window?.ReactNativeWebView?.postMessage(
          JSON.stringify({ type: 'reload.submit' })
        );

        router.push(
          `/mobile/result/${podcast.id}?access_token=${Cookie.fromDocument('access_token')}`
        );
      }
    } catch (err) {
      setStatus(Status.Error);
    }
  };

  // disable x close button after submitting
  // user have to wait until the process is done
  const closeModal = () => {
    if (status === Status.None || status === Status.Error) {
      onCancel();
    }
  };

  return (
    <Modal
      title={<div />}
      footer={<div />}
      onCancel={closeModal}
      headerClassName="hidden"
      width="460px"
      panelClassName="min-h-[260px]"
      {...otherProps}
    >
      {/* First screen */}
      {status === Status.None && (
        <div className="flex flex-col items-center px-4 pb-2">
          <DocumentArrowUpIcon className="w-[64px] h-[64px] text-red-500 mb-4" />

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Nộp bài nghe
          </h3>

          <p className="text-sm text-center text-gray-600 mb-8">
            Bạn đã chắc chắn muốn nộp bài nghe? Sẽ không <br /> quay lại được
            đâu bạn nhé!
          </p>

          <div className="flex gap-2">
            <Button className="w-[160px]" type="solid" onClick={handleSubmit}>
              Nộp bài
            </Button>

            <Button className="w-[160px]" type="outline" onClick={closeModal}>
              Đóng
            </Button>
          </div>
        </div>
      )}

      {/* Second screen: Submitting */}
      {status === Status.Submitting && (
        <div className="flex flex-col items-center px-4 pb-2">
          <img
            src="/static/svg/animate/paper-plane.svg"
            alt="icon"
            className="w-[100px]"
          />

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Đang nộp bài...
          </h3>

          <p className="text-sm text-center text-gray-600 mb-8">
            <span>
              Bài nghe của bạn đang được gửi đi, quá trình <br /> sẽ diễn ra
              trong vài giây
            </span>
          </p>
        </div>
      )}

      {/* Third screen: Checking */}
      {status === Status.Checking && (
        <div className="flex flex-col items-center px-4 pb-2">
          <img
            src="/static/svg/animate/sign.svg"
            alt="icon"
            className="w-[120px]"
          />

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Đang chấm điểm...
          </h3>

          <p className="text-sm text-center text-gray-600 mb-8">
            <span>
              WELE đang chấm điểm bài nghe của bạn, quá trình <br /> sẽ diễn ra
              trong vài giây
            </span>
          </p>
        </div>
      )}

      {/* Fourth screen: Checking */}
      {status === Status.Generating && (
        <div className="flex flex-col items-center px-4 pb-2">
          <img
            src="/static/svg/animate/photo-stack.svg"
            alt="icon"
            className="w-[120px]"
          />

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Tạo trang kết quả...
          </h3>

          <p className="text-sm text-center text-gray-600 mb-8">
            <span>
              Trang kết quả của bạn đang được tạo, quá trình <br /> sẽ diễn ra
              trong vài giây
            </span>
          </p>
        </div>
      )}

      {/* Fifth screen: Success */}
      {status === Status.Success && (
        <div className="flex flex-col items-center px-4 pb-2">
          <img
            src="/static/svg/animate/party-congrat.svg"
            alt="icon"
            className="w-[120px]"
          />

          <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
            Chúc mừng!
          </h3>

          <p className="text-sm text-center text-gray-600 mb-8">
            Bài nghe của bạn được nộp thành công <br /> và đã có kết quả
          </p>

          <div className="flex gap-2">
            <Link href={Podcast.getResultURL(podcast)}>
              <Button
                className="min-w-[160px]"
                type="solid"
                onClick={() => setRedirecting(true)}
              >
                Xem kết quả
              </Button>
            </Link>

            <Link href={Podcast.getURL(podcast)}>
              <Button
                className="w-[160px]"
                type="outline"
                onClick={() => setRedirecting(true)}
              >
                Quay lại
              </Button>
            </Link>
          </div>

          {redirecting && (
            <p className="text-sm text-gray-700 text-center mt-4">
              Đang chuyển trang...
            </p>
          )}
        </div>
      )}

      {/*  Ads block */}
      {/* Only show for Freemium user and from 2nd screen */}
      {!isPremium && status !== Status.None ? (
        <div className="mt-8">
          <div className="h-[1px] w-full bg-gray-100 mb-6" />

          {/* call to action */}
          <div className="text-gray-900 text-sm mb-4">
            <p className="mb-1 font-semibold">
              Click quảng cáo để ủng hộ WELE bạn nhé!
            </p>
            <p className="text-orange-500">
              Một cú click vào quảng cáo nhỏ ở phía dưới thôi cũng là cách tuyệt
              vời để bọn mình có thêm động lực và nguồn lực tiếp tục phát triển
              các tính năng mới trong tương lai.
            </p>
          </div>

          {justANumber % 2 === 0 ? <AdsBook data={Ads} /> : <AIHayAd />}
        </div>
      ) : null}
    </Modal>
  );
}
