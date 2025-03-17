import {
  CalendarIcon,
  CircleStackIcon,
  MicrophoneIcon,
  PlusIcon,
  UserPlusIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { OutOfCoinWarning } from '@/app/(inapp)/_components/OutOfCoinWarning';
import { TimeStatus } from '@/app/(inapp)/challenges/_components/TimeStatus';
import { ChallengeApi } from '@/app/(inapp)/challenges/challengeApi';
import { Status, Type } from '@/app/(inapp)/challenges/challengeConstant';
import { RawChallenge } from '@/app/(inapp)/challenges/challengeType';
import { Button, Modal } from '@/components/common';
import Constants, { Code } from '@/core/Constants';
import { useReloadMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { Challenge } from '@/modules/challenge/challenge';
import { Helper } from '@/services/Helper';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';

type GeneralProps = {
  challenge: RawChallenge;
  userDetail?: RawChallenge;
  linkButton?: React.ReactNode;
  reloadData?: () => void;
};

export function General({
  challenge,
  userDetail,
  reloadData,
  linkButton,
}: GeneralProps) {
  const [outOfCoinWarning, setOutOfCoinWarning] = useState(false);

  const { reloadMe } = useReloadMe();

  const meData = MeHook.useMe();

  const router = useRouter();

  const { trigger: join, isMutating: joining } = useSWRMutation(
    ChallengeApi.Join,
    Fetch.postFetcher.bind(Fetch)
  );

  const [openJoinModal, setOpenJoinModal] = useState(false);

  const handleJoin = useCallback(async () => {
    const wallet1 = meData?.allowance_coin ?? 0;
    const wallet2 = meData?.earning_coin ?? 0;
    const lostCoin = challenge?.lost_coin ?? 0;

    // Check if user has enough coin to subscribe
    if (wallet1 + wallet2 < lostCoin) {
      setOutOfCoinWarning(true);
      return;
    }

    const result: AnyObject = await join({
      payload: { challenge_id: challenge.id },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      toast.success('Chào mừng bạn đến với thử thách mới!');

      setOpenJoinModal(false);

      reloadMe();

      if (reloadData) {
        reloadData();
      }
    }
  }, [challenge, join, meData, reloadData, reloadMe]);

  const isLimitTime = useMemo(
    () => challenge?.type === Type.TimeLimit,
    [challenge]
  );

  const timeLimit = useMemo(
    () => challenge?.data?.time_limit || 0,
    [challenge]
  );

  const startTime = useMemo(
    () => (challenge?.data?.start_time || 0) * 1000,
    [challenge]
  );

  const endTime = useMemo(
    () => (challenge?.data?.end_time || 0) * 1000,
    [challenge]
  );

  const isFinished = useMemo(() => {
    const currentTime = new Date().getTime();

    if (challenge?.type === Type.TimeRange) {
      return (challenge.data.end_time || 0) * 1000 < currentTime;
    }

    return challenge.metatype === Status.Finished;
  }, [challenge]);

  const onJoinNowClick = useCallback(() => {
    if (meData?.id) {
      setOpenJoinModal(true);
    } else {
      router.push(`/authentication/login?from=${Challenge.getURL(challenge)}`);
    }
  }, [challenge, meData?.id, router]);

  const actionButton = useMemo(() => {
    const joined = Number(userDetail?.is_joined);

    if (joined) {
      return (
        <Button type="outline" className="pointer-events-none">
          <UsersIcon className="w-5 h-5" /> Đã tham gia
        </Button>
      );
    }

    return (
      <Button
        loading={joining}
        onClick={onJoinNowClick}
        disabled={isFinished && !isLimitTime}
      >
        <PlusIcon className="w-5 h-5" /> Tham gia ngay
      </Button>
    );
  }, [userDetail?.is_joined, joining, onJoinNowClick, isFinished, isLimitTime]);

  const challengeRuleDetail = useMemo(() => {
    let time = null;

    let podcast = null;

    if (isLimitTime) {
      time = (
        <li>
          Bạn cần hoàn thành thử thách trong{' '}
          <span className="font-semibold">
            {Math.floor(timeLimit / 86400)} ngày
          </span>
          . Thời gian sẽ được tính từ lúc bạn tham gia thử thách.
        </li>
      );
    }

    if (!isLimitTime) {
      time = (
        <li>
          Bạn cần hoàn thành thử thách trong khoảng thời gian{' '}
          <span className="font-semibold">
            {`${dayjs(startTime).format('DD/MM/YYYY')}
               -
              ${dayjs(endTime).format('DD/MM/YYYY')}`}
          </span>
          .
        </li>
      );
    }

    if (challenge?.podcasts_data) {
      podcast = (
        <li>
          Bạn cần hoàn thành{' '}
          <span className="font-semibold">
            {challenge?.podcasts_data?.length} podcasts
          </span>{' '}
          đã được chỉ định.
        </li>
      );
    } else {
      podcast = (
        <li>
          Số lượng podcasts cần hoàn thành{' '}
          <span className="font-semibold">không giới hạn</span> (càng nhiều càng
          tốt).
        </li>
      );
    }

    return (
      <ul className="list-disc pl-6 flex flex-col gap-2">
        {time}
        {podcast}
      </ul>
    );
  }, [challenge?.podcasts_data, endTime, isLimitTime, startTime, timeLimit]);

  return (
    <div className="flex gap-8 rounded-lg bg-white p-4">
      <Modal
        open={openJoinModal}
        onCancel={() => setOpenJoinModal(false)}
        title="Xác nhận tham gia"
        cancelText="Hủy"
        okText="Đồng ý tham gia"
        width="560px"
        onOk={handleJoin}
        okButtonProps={{ loading: joining }}
      >
        <div className="py-4 text-sm">
          <p className="mb-2">
            Bạn sẽ nhận được{' '}
            <span className="text-primary">
              {Helper.getCoinString(challenge.reward_coin)}
            </span>{' '}
            khi hoàn thành thử thách.
          </p>

          <p className="mb-6">
            Phí tham gia thử thách là{' '}
            <span className="text-red-500">
              {Helper.getCoinString(challenge.lost_coin)}
            </span>
            .
          </p>

          <div>
            <h4 className="font-medium mb-2">
              Thông tin chi tiết về thử thách:
            </h4>
            {challengeRuleDetail}
          </div>
        </div>

        <OutOfCoinWarning
          open={outOfCoinWarning}
          onCancel={() => setOutOfCoinWarning(false)}
        />
      </Modal>

      <div
        className="w-1/2 bg-cover bg-center rounded-lg"
        style={{
          aspectRatio: '2/1',
          backgroundImage: `url(${Constants.IMAGE_URL}${challenge.image_url})`,
        }}
      />

      <div className="flex-1 flex flex-col justify-between items-start w-1/2">
        <h3 className="text-3xl font-medium text-gray-900 mb-2">
          {challenge.name}
        </h3>

        <p
          className="text-sm text-gray-500 line-clamp-5 mb-8"
          title={challenge.description ?? ''}
          dangerouslySetInnerHTML={{ __html: challenge.description ?? '' }}
        />

        <div className="flex items-start flex-wrap gap-x-10 gap-y-4 text-sm text-gray-900 w-full">
          {challenge.type === Type.TimeRange && (
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              {`${dayjs(startTime).format('DD/MM/YYYY')}
               -
              ${dayjs(endTime).format('DD/MM/YYYY')}`}
            </div>
          )}

          <TimeStatus data={userDetail ?? challenge} />

          <div className="flex items-center gap-2">
            <UserPlusIcon className="w-5 h-5" />
            {challenge?.members_data?.length
              ? `${challenge.members_data.length} người tham gia`
              : 'Chưa có người tham gia'}
          </div>

          <div className="flex items-center gap-2" title="Số lượng podcasts">
            <MicrophoneIcon className="w-5 h-5" />
            {challenge?.podcasts_data?.length} podcasts
          </div>

          <div className="flex items-center gap-2">
            <CircleStackIcon className="w-5 h-5 text-orange-500" />
            <span>
              <span className="text-green-500">+{challenge.reward_coin}</span>
              <span className="text-gray-500"> / </span>
              <span className="text-red-500">-{challenge.lost_coin}</span>
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {linkButton ?? actionButton}
      </div>
    </div>
  );
}
