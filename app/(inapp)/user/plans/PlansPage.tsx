'use client';

import {
  ArrowTopRightOnSquareIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';
import Link from 'next/link';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { Button } from '@/components/common';
import { Pricing } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import PaymentService from '@/lib/payment';
import DateUtil from '@/services/Date';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';
import { MeHook } from '@/store/me/hooks';
import { RawOrderSubscription, RawSubscription } from '@/store/types';

import { QRCodeModal } from './_components/QRCodeModal';
import { SelectPaymentModal } from './_components/SelectPaymentMethodModal';

type PeriodItemObject = {
  name: string;
  id: string;
};

type PriceObject = {
  annually: number;
  life_time: number;
};

type PlanObject = {
  name: string;
  id: string;
  price: PriceObject;
  features: string[];
  highlight?: boolean;
};

function PricingPlanItem(props: {
  plan: PlanObject;
  activePeriod?: PeriodItemObject;
}) {
  const { plan, activePeriod } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [openQR, setOpenQR] = useState(false);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const sub = MeHook.useSubscription();

  console.log(sub);

  const isCurrentPlan = sub?.plan === plan.id || (!sub && plan.id === 'free');

  let currentPeriod = activePeriod as PeriodItemObject;

  if (!activePeriod) {
    currentPeriod = Pricing.periods.annually;
  }

  const price = plan.price[currentPeriod.id as keyof PriceObject];

  const startTrial = useCallback(async () => {
    setLoading(true);

    try {
      const res: AnyObject = await Fetch.postWithAccessToken<{
        order: RawOrderSubscription;
      }>('/api/subscription/order/create', {
        price,
        period: currentPeriod.id,
        plan: plan.id,
        name: `${plan.name} ${currentPeriod.name}`,
      });

      if (res.data && !res.data.code) {
        await MeFunctions.loadProfile();
      } else if (res.data) {
        toast.error(res?.data?.message);
      } else {
        toast.error('Có lỗi xảy ra');
      }
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }

    setLoading(false);
  }, [currentPeriod, plan, price]);

  const currencyFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  const features = plan.features.map((feature: string, index: number) => (
    <div key={index} className="flex items-start gap-x-3">
      <CheckIcon className={clsx('w-5 h-5 text-primary')} />

      <span className={clsx('w-full text-sm text-gray-900')}>{feature}</span>
    </div>
  ));

  let ctaButton = null;

  if (isCurrentPlan) {
    if (price > 0 && sub && (!sub.is_effective || sub.is_freetrial)) {
      ctaButton = (
        <Button
          type="solid"
          size="large"
          onClick={() => setOpenModal(true)}
          className="w-full"
          loading={loading}
        >
          Nâng cấp ngay
        </Button>
      );
    } else {
      ctaButton = (
        <Button
          type="outline"
          size="large"
          className="w-full pointer-events-none"
        >
          Đang sử dụng
        </Button>
      );
    }
  } else if (!sub && price > 0) {
    ctaButton = (
      <Button
        type="solid"
        size="large"
        onClick={startTrial}
        className="w-full"
        loading={loading}
      >
        Bắt đầu dùng thử 7 ngày
      </Button>
    );
  } else if (sub && price > 0) {
    ctaButton = (
      <Button
        type="solid"
        size="large"
        onClick={() => setOpenModal(true)}
        className="w-full"
        loading={loading}
      >
        Nâng cấp ngay
      </Button>
    );
  }

  if (plan.id === 'groupon') {
    ctaButton = (
      <Link target="_blank" href="https://www.facebook.com/welevn">
        <Button type="secondary" className="w-full">
          Liên hệ fanpage
        </Button>
      </Link>
    );
  }

  if (
    plan.id === 'premium' &&
    activePeriod?.id === 'life_time' &&
    sub?.plan !== 'life_time'
  ) {
    ctaButton = (
      <Button
        type="solid"
        size="large"
        onClick={() => setOpenModal(true)}
        className="w-full"
        loading={loading}
      >
        Nâng cấp ngay
      </Button>
    );
  }

  return (
    <>
      <SelectPaymentModal
        openQRCode={() => {
          // setOpenModal(false);
          setOpenQR(true);
        }}
        open={openModal}
        subscription={sub}
        onCancel={() => setOpenModal(false)}
        onError={() => {
          setOpenModal(false);
        }}
        onSuccess={() => {}}
      >
        {sub && (
          <QRCodeModal
            subscription={sub}
            onError={function (message: string): void {}}
            onSuccess={function (
              message: string,
              subscription?: RawSubscription
            ): void {
              setOpenQR(false);
              setOpenModal(false);
              toast.success(message);
            }}
            open={openQR}
            onCancel={() => {
              setOpenQR(false);
            }}
          />
        )}
      </SelectPaymentModal>
      <div
        className={clsx(
          'flex flex-col w-full xs:w-96 rounded-lg border border-solid border-gray-300 p-6 min-h-[500px]'
        )}
      >
        <div className="pb-4 text-gray-900">
          <p
            className={clsx(
              'text-sm font-medium text-gray-900 mb-4 flex justify-between items-center'
            )}
          >
            {plan.name}
          </p>

          <h4 className={clsx('text-4xl font-medium')}>
            {currencyFormat.format(price * 1000)}{' '}
            <span className="text-xl text-gray-500">
              {' '}
              / {activePeriod?.id === 'annually' ? 'năm' : 'trọn đời'}
            </span>
          </h4>
        </div>

        {ctaButton}

        <div className="flex flex-col gap-y-4 pt-6 pb-10 flex-1">
          {features}
        </div>
      </div>
    </>
  );
}

export function PlansPage() {
  const sub = MeHook.useSubscription();

  const [loadingPortal, setLoadingPortal] = useState<boolean>(false);

  const subText = useMemo(() => {
    if (!sub || sub.plan === 'free') {
      return (
        <span>
          Bạn đang sử dụng gói <span className="font-bold">Free</span>, nâng cấp
          lên <span className="font-bold">Premium</span> để tận dụng hết sức
          mạnh của WELE bạn nhé.
        </span>
      );
    }

    if (sub?.period === 'life_time') {
      return (
        <span>
          Bạn đang sử dụng gói <span className="font-bold">Premium</span>trọn
          đời.
        </span>
      );
    }

    if (sub?.plan === 'premium' && sub?.is_freetrial) {
      return (
        <span>
          Bạn đang dùng thử gói <span className="font-semibold">Premium</span>{' '}
          có thời hạn đến ngày{' '}
          <span className="font-semibold">{DateUtil.getDay(sub.end_date)}</span>
          .
        </span>
      );
    }

    if (sub?.plan === 'premium' && sub?.is_effective) {
      return (
        <span>
          Bạn đang sử dụng gói <span className="font-semibold">Premium</span> có
          thời hạn đến ngày{' '}
          <span className="font-semibold">{DateUtil.getDay(sub.end_date)}</span>
          .
        </span>
      );
    }

    if (sub?.plan === 'premium' && sub?.end_date < new Date().getTime()) {
      return (
        <span>
          Gói <span className="font-semibold">Premium</span> của bạn đã{' '}
          <span className="font-bold"> hết hạn</span>&nbsp;từ ngày{' '}
          {DateUtil.getDay(sub.end_date)}.
        </span>
      );
    }

    return null;
  }, [sub]);

  const openPortal = useCallback(async () => {
    if (sub?.linked_lemonsequeezy_object?.data?.id) {
      setLoadingPortal(true);

      try {
        const portalUrl = await PaymentService.getPortal();

        if (portalUrl) {
          window.open(portalUrl);
        } else {
          toast.error('Có lỗi xảy ra');
        }
      } catch (e) {
        toast.error('Có lỗi xảy ra');
      }

      setLoadingPortal(false);
    }
  }, [sub]);

  const plans = Object.values(Pricing.options).map((e) => (
    <PricingPlanItem
      key={e.id}
      plan={e}
      activePeriod={Pricing.periods.annually}
    />
  ));

  return (
    <section className="bg-white p-6 rounded-lg">
      <div className="flex justify-between items-start">
        <div className="mb-8 w-2/3">
          <h1
            id="pricing"
            className="text-base font-semibold leading-6 text-gray-900"
          >
            Gói dịch vụ của bạn
          </h1>

          <p className="mt-2 text-sm text-gray-700">{subText}</p>
        </div>

        {sub?.linked_lemonsequeezy_object?.data?.id ? (
          <Button onClick={openPortal} loading={loadingPortal}>
            Quản lý gói đăng ký
            <ArrowTopRightOnSquareIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : null}
      </div>

      <div className="flex flex-col-reverse lg:flex-row gap-8 flex-wrap">
        {plans}

        <PricingPlanItem
          plan={Pricing.options.premium}
          activePeriod={Pricing.periods.life_time}
        />
      </div>
    </section>
  );
}
