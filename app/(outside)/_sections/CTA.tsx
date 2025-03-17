'use client';

import { ButtonGradient } from '@/app/(outside)/_components/ButtonGradient';
import {
  HeadingH2,
  TextBodyLarge,
} from '@/app/(outside)/_components/Typography';
import { Container } from '@/components/layout/container/container';

export function CTA() {
  return (
    <section className="bg-mesh-gradient bg-cover bg-right-center relative">
      <Container className="py-[120px]">
        <HeadingH2 className="text-center mb-4">
          Tham gia cộng đồng học tiếng anh
          <br className="hidden md:block" /> của WELE với hơn 10,000+ thành viên
        </HeadingH2>

        <TextBodyLarge className="text-center mb-8">
          Chúng mình có nhóm Zalo và Facebook để hỗ trợ các bạn học viên
        </TextBodyLarge>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <a href="https://zalo.me/g/kictbj112" target="_blank">
            <ButtonGradient type="solid">Tham gia nhóm Zalo</ButtonGradient>
          </a>

          <a
            href="https://www.facebook.com/groups/464396007027802"
            target="_blank"
          >
            <ButtonGradient type="outlined">
              Tham gia nhóm Facebook
            </ButtonGradient>
          </a>
        </div>
      </Container>

      <div className="hidden md:block flying-box">
        <span className="absolute w-[10px] h-[10px] left-[4%] top-[40%] rounded-full bg-yellow-400 flying-6s" />
        <span className="absolute w-[20px] h-[20px] left-[12%] top-[45%] rounded-full bg-purple-500 flying-8s" />
        <span className="absolute w-[18px] h-[18px] left-[16%] top-[30%] rounded-full bg-green-500 flying-10s" />
        <span className="absolute w-[10px] h-[10px] left-[20%] top-[22%] rounded-full bg-rose-500 flying-9s" />

        <span className="absolute w-[34px] h-[34px] right-[10%] top-[22%] rounded-full bg-rose-500 flying-6s" />
        <span className="absolute w-[10px] h-[10px] right-[8%] top-[35%] rounded-full bg-yellow-400 flying-7s" />
        <span className="absolute w-[20px] h-[20px] right-[12%] top-[42%] rounded-full bg-purple-500 flying-11s" />
        <span className="absolute w-[6px] h-[6px] right-[20%] top-[38%] rounded-full bg-green-500 flying-9s" />
      </div>
    </section>
  );
}
