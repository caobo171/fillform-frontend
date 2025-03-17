import { AxiosResponse } from 'axios';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { KeyedMutator } from 'swr';
import useSWRMutation from 'swr/mutation';

import { OutOfCoinWarning } from '@/app/(inapp)/_components/OutOfCoinWarning';
import { Button, Modal } from '@/components/common';
import { Container } from '@/components/layout/container/container';
import { Code } from '@/core/Constants';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';
import { MeHook } from '@/store/me/hooks';
import { RawWeleClass } from '@/store/types';

type SubscribeProps = {
  data?: RawWeleClass;
  reloadClass?: KeyedMutator<AxiosResponse<unknown, AnyObject>>;
};

export function Subscribe({ data, reloadClass }: SubscribeProps) {
  const [outOfCoinWarning, setOutOfCoinWarning] = useState(false);

  const me = MeHook.useMe();

  const { trigger: subscribe, isMutating } = useSWRMutation(
    '/api/me/subscribe.class',
    Fetch.postFetcher.bind(Fetch)
  );

  const [open, setOpen] = useState<boolean>(false);

  const handleSubscribe = useCallback(async () => {
    const wallet1 = me?.allowance_coin ?? 0;
    const wallet2 = me?.earning_coin ?? 0;
    const lostCoin = data?.lost_coin ?? 0;

    // Check if user has enough coin to subscribe
    if (wallet1 + wallet2 < lostCoin) {
      setOutOfCoinWarning(true);
      return;
    }

    const res: AnyObject = await subscribe({ payload: { class_id: data?.id } });

    if (res.data?.code === Code.Error) {
      toast.error(res.data?.message ?? 'Đã có lỗi xảy ra!');
    } else {
      toast.success('Tham gia lớp học thành công!');

      reloadClass?.();

      setOpen(false);
    }
  }, [data, reloadClass, subscribe, me]);

  return (
    <>
      <Modal
        title="Xác nhận tham gia lớp học"
        open={open}
        onCancel={() => setOpen(false)}
        onOk={handleSubscribe}
        okButtonProps={{ loading: isMutating }}
        okText="Ok, tham gia luôn"
        cancelText="Hủy"
        width="500px"
      >
        <ul className="py-4 text-sm text-gray-900 flex flex-col gap-2 list-disc pl-4">
          <li>
            Phí tham gia lớp học là{' '}
            <span className="font-semibold text-primary">
              {data?.lost_coin}
            </span>{' '}
            WELE Coins.
          </li>

          <li>Bạn sẽ phải trả phí này mỗi tháng để duy trì lớp học.</li>

          <li>
            WELE sẽ <span className="text-primary">không tự động gia hạn</span>{' '}
            cho lớp học của bạn, chúng mình sẽ thông báo cho bạn trước khi hết
            hạn 3 ngày.
          </li>
        </ul>

        <OutOfCoinWarning
          open={outOfCoinWarning}
          onCancel={() => setOutOfCoinWarning(false)}
        />
      </Modal>

      <div className="fixed bottom-0 left-0 z-2 w-full h-screen-50 bg-gradient-to-t from-white via-white">
        <Container className="h-full flex flex-col gap-4 items-start justify-end pb-10">
          <div className="flex items-center gap-4">
            <Button size="large" onClick={() => setOpen(true)}>
              <img
                src="/static/svg/person-walking.svg"
                alt="icon"
                className="w-6 h-auto"
              />
              Tham gia lớp học
            </Button>

            <p className="text-sm text-gray-600">
              {data?.lost_coin ? (
                <>
                  <b>{data?.lost_coin ?? 0}</b> coins/tháng.
                </>
              ) : (
                'Miễn phí.'
              )}{' '}
              Hủy bất cứ lúc nào.
            </p>
          </div>
        </Container>
      </div>
    </>
  );
}
