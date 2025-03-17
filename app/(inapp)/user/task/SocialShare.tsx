import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import useSWRMutation from 'swr/mutation';

import { useEarnedCoinNotify } from '@/app/(inapp)/_components/CoinNofity';
import { Button, Input, Modal, ModalProps } from '@/components/common';
import { FileUploader } from '@/components/form';
import { Code } from '@/core/Constants';
import { useReloadMe } from '@/hooks/user';
import Fetch from '@/lib/core/fetch/Fetch';
import { AnyObject } from '@/store/interface';

const SocialList = [
  'youtube',
  'facebook',
  'x.com',
  'linkedin',
  'tiktok',
  'zalo',
  'threads',
  'instagram',
];

export function SocialShare({ onCancel, ...rest }: ModalProps) {
  const { notify } = useEarnedCoinNotify();

  const { reloadMe } = useReloadMe();

  const linkRef = useRef<HTMLInputElement>(null);

  const reactionRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState<File[]>([]);

  const [linkInvalid, setLinkInvalid] = useState<boolean>(false);

  const { trigger: send, isMutating } = useSWRMutation(
    '/api/social/share',
    Fetch.postFetcher.bind(Fetch)
  );

  const sendForm = useCallback(async () => {
    const link = linkRef.current?.value;

    const reaction = reactionRef.current?.value;

    if (!link || !reaction) {
      toast.error('Vui lòng điền đầy đủ thông tin');

      return;
    }

    const isValid = !!SocialList.find((item) => link.includes(item));

    if (!isValid) {
      setLinkInvalid(true);

      return;
    }

    const result: AnyObject = await send({
      payload: { public_link: link, reaction_total: reaction, image: image[0] },
    });

    if (result?.data?.code === Code.Error) {
      toast.error(result?.data?.message);
    } else {
      notify(result?.data?.share_social?.reward_coin ?? 0);

      setLinkInvalid(false);

      onCancel();

      reloadMe();
    }
  }, [image, notify, onCancel, reloadMe, send]);

  useEffect(() => {
    if (!rest?.open) {
      setImage([]);
    }
  }, [rest?.open]);

  return (
    <Modal
      {...rest}
      title="Nhận ngay 50 coins"
      width="560px"
      okText="Đóng"
      onCancel={onCancel}
      onOk={onCancel}
      cancelButtonProps={{ className: 'hidden' }}
    >
      <div className="py-4 text-sm text-gray-900">
        <h4 className="font-semibold mb-3">Chỉ với 2 bước đơn giản:</h4>

        <ol className="mb-3 pl-4 list-decimal flex flex-col gap-2">
          <li>
            Chia sẻ trên mạng xã hội về WELE và sử dụng hashtag #welelearn
          </li>

          <li>
            Copy link bài chia sẻ của bạn và dán vào form bên dưới. Với mỗi
            reaction từ bài chia sẻ, bạn sẽ nhận được 1 coin tương ứng (tối đa
            50 coins).
          </li>
        </ol>

        <a
          target="_blank"
          className="inline-block text-sm text-primary hover:text-primary-800 underline mb-6"
          href="https://blog.wele-learn.com/cach-kiem-wele-xu-qua-post-tren-mang-xa-hoi/"
        >
          Xem hướng dẫn chi tiết
        </a>

        <div className="flex flex-col gap-3 mb-6 items-start">
          <div className="flex flex-col gap-2 w-full">
            <Input
              placeholder="Link bài chia sẻ"
              className="w-full"
              ref={linkRef}
            />
            {linkInvalid && (
              <p className="flex flex-col gap-1 text-red-500">
                <span>Link bài chia sẽ không hợp lệ</span>
                <span className="text-xs">
                  Link bài chia sẽ là link bài post của bạn trên mạng xã hội,
                  không phải link bài nghe của Wele. Ví dụ:
                  https://www.facebook.com/lth/posts/1
                </span>
              </p>
            )}
          </div>

          <Input
            type="number"
            placeholder="Số lượng reaction của bài chia sẻ"
            ref={reactionRef}
          />

          <FileUploader
            className="w-full"
            icon={
              <span className="text-gray-400 -mb-2">
                Ảnh chụp màn hình bài chia sẻ (không bắt buộc)
              </span>
            }
            onChange={(files) => setImage(files)}
          />

          <Button loading={isMutating} onClick={sendForm}>
            Gửi thông tin
          </Button>
        </div>

        <p className="text-xs text-gray-500">
          Chú ý: Bạn sẽ nhận được coin ngay lập tức sau khi gửi form. Admin sẽ
          kiểm duyệt tính chính xác của thông tin, trường hợp thông tin không
          chính xác, số coin của bạn sẽ bị thu hồi.
        </p>
      </div>
    </Modal>
  );
}
