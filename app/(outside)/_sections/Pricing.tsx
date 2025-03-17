'use client';

import { CheckIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import {
  CaptionSmall,
  HeadingH2,
  HeadingH3,
  TextBody,
  TextBodyHighLight,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { motionAnimation } from '@/app/(outside)/constants';
import { Container } from '@/components/layout/container/container';
import { Pricing } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import PaymentService from '@/lib/payment';
import { AnyObject } from '@/store/interface';
import { MeFunctions } from '@/store/me/functions';
import { MeHook } from '@/store/me/hooks';
import { RawOrderSubscription } from '@/store/types';

type PeriodItemObject = {
  name: string;
  id: string;
};

type PeriodObject = {
  annually: PeriodItemObject;
  life_time: PeriodItemObject;
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

function PeriodItem(props: {
  active: boolean;
  periodKey: keyof PeriodObject;
  click: (key: keyof PeriodObject) => void;
}) {
  const { active, periodKey, click } = props;

  const period = (Pricing.periods as PeriodObject)[periodKey];

  return (
    <button
      onClick={() => click && click(periodKey)}
      className={clsx('rounded-full py-0.5 px-4 cursor-pointer', {
        'bg-primary': active,
      })}
    >
      <TextBodyHighLight className={active ? 'text-white' : 'text-gray-900'}>
        {period.name}
      </TextBodyHighLight>
    </button>
  );
}

function PricingPlanItem(props: {
  plan: PlanObject;
  activePeriod: PeriodItemObject;
}) {
  const { plan, activePeriod } = props;

  const route = useRouter();

  const me = MeHook.useMe();

  const sub = MeHook.useSubscription();

  const isCurrentPlan = sub?.plan === plan.id || (!sub && plan.id === 'free');

  let currentPeriod = activePeriod as PeriodItemObject;

  const [loading, setLoading] = useState<boolean>(false);

  if (!activePeriod) {
    currentPeriod = Pricing.periods.annually;
  }

  const price = plan.price[activePeriod.id as keyof PriceObject];

  const currencyFormat = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  const upgrade = useCallback(async () => {
    if (!me) {
      route.push('/authentication/login?from=/pricing');

      return;
    }

    setLoading(true);

    try {
      const url = await PaymentService.getCheckout();

      if (url) {
        window.location = url;
      } else {
        toast.error('Có lỗi xảy ra');
      }
    } catch (e) {
      toast.error('Có lỗi xảy ra');
    }

    setLoading(false);
  }, [me, route]);

  const startTrial = useCallback(async () => {
    if (!me) {
      return route.push('/authentication/login?from=/pricing');
    }

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

    return null;
  }, [me]);

  const ctaButton = useMemo(() => {
    if (plan.id === 'groupon') {
      return (
        <Link target="_blank" href="https://www.facebook.com/welevn">
          <ButtonGradient type="outlined" className="w-full">
            Liên hệ fanpage
          </ButtonGradient>
        </Link>
      );
    }

    if (price <= 0) {
      return (
        <ButtonGradient type="outlined" onClick={() => route.push('/home')}>
          Bắt đầu dùng miễn phí
        </ButtonGradient>
      );
    }

    if (isCurrentPlan) {
      if (price > 0 && sub && !sub.status) {
        return (
          <ButtonGradient type="solid" onClick={upgrade} loading={loading}>
            Nâng cấp ngay
          </ButtonGradient>
        );
      }

      return (
        <ButtonGradient type="solid" className="pointer-events-none">
          Đang sử dụng
        </ButtonGradient>
      );
    }

    if (!sub && price > 0) {
      return (
        <ButtonGradient type="solid" onClick={startTrial} loading={loading}>
          Bắt đầu dùng thử 7 ngày
        </ButtonGradient>
      );
    }

    if (sub && price > 0) {
      return (
        <ButtonGradient type="solid" onClick={upgrade} loading={loading}>
          Nâng cấp ngay
        </ButtonGradient>
      );
    }

    return null;
  }, [
    plan?.id,
    price,
    isCurrentPlan,
    sub,
    route,
    upgrade,
    loading,
    startTrial,
  ]);

  const features = plan.features.map((feature: string, index: number) => (
    <div key={index} className="flex items-start gap-x-3 text-gray-900">
      <CheckIcon className={clsx('w-6 h-auto text-primary')} />

      <TextBody className={clsx('w-full')}>{feature}</TextBody>
    </div>
  ));

  const planBlock = (
    <div
      className={clsx(
        'flex flex-col w-full xs:w-[384px] rounded-[24px] border border-solid p-6',
        plan.highlight ? 'border-primary' : 'border-gray-200'
      )}
    >
      <div className="pb-6 border-b border-solid border-gray-200">
        <div className={clsx('mb-6 flex justify-between')}>
          <TextBodyHighLight className="text-primary">
            {plan.name}
          </TextBodyHighLight>

          {plan.highlight && (
            <CaptionSmall className="inline-flex items-center h-5 rounded-full text-primary px-2 bg-red-50">
              {activePeriod.id === 'annually'
                ? 'Phổ biến nhất'
                : 'Tiết kiệm 70%'}
            </CaptionSmall>
          )}
        </div>

        <HeadingH3>{currencyFormat.format(price * 1000)}</HeadingH3>
      </div>

      <div className="flex flex-col gap-y-6 pt-6 pb-10 flex-1">{features}</div>

      {ctaButton}
    </div>
  );

  return planBlock;
}

function PeriodPriceTable({
  activePeriod,
}: {
  activePeriod: PeriodItemObject;
}) {
  const plans = Object.values(Pricing.options).map((e) => (
    <PricingPlanItem key={e.id} activePeriod={activePeriod} plan={e} />
  ));

  return <div className="flex flex-col lg:flex-row gap-8">{plans}</div>;
}

export function HomePricing() {
  const [periodKey, setPeriodKey] = useState<keyof PeriodObject>('annually');

  const options = Object.values(Pricing.periods).map((opt) => (
    <PeriodItem
      key={opt.id}
      click={(key) => setPeriodKey(key)}
      periodKey={opt.id as keyof PeriodObject}
      active={periodKey === opt.id}
    />
  ));

  return (
    <section className="bg-white py-[120px]">
      <Container className="flex flex-col items-center">
        <motion.div {...motionAnimation.showUp} className="relative">
          <HeadingH2 className="text-center mb-4 relative z-2">
            WELE hoàn toàn Miễn Phí
          </HeadingH2>

          <img
            src="/static/landing/brush/mien_phi.svg"
            alt="brush"
            className="hidden md:inline-block absolute z-1 right-[-8px] bottom-[6px]"
          />
        </motion.div>

        <motion.div {...motionAnimation.showUp}>
          <TextBodyLarge className="text-center mb-14">
            Với gói Premium, kỹ năng nghe của bạn sẽ cải thiện nhanh
            <br /> gấp bội với mobile app và các tính năng ưu việt.
          </TextBodyLarge>
        </motion.div>

        <motion.div
          {...motionAnimation.showUp}
          className="border border-gray-200 rounded-full inline-flex p-1 gap-1 mb-10"
        >
          {options}
        </motion.div>

        <motion.div {...motionAnimation.showUp}>
          <PeriodPriceTable
            activePeriod={(Pricing.periods as PeriodObject)[periodKey]}
          />
        </motion.div>
      </Container>
    </section>
  );
}
