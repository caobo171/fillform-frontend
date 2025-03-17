import { TextBody } from '@/app/(outside)/_components/Typography';
import { Container } from '@/components/layout/container/container';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="py-20">
      <Container>
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center md:justify-between border border-red-50 rounded-lg h-[160px] p-10 bg-mesh-gradient bg-cover">
          <TextBody className="text-center md:text-left">
            <span className="font-bold">©</span>
            2024 WELE Vietnam. All rights reserved.
          </TextBody>
          <TextBody className="text-center md:text-left">
            <Link href="/terms">Privacy</Link>
          </TextBody>
          <TextBody className="text-center md:text-left">
            <Link href="/terms">Terms of use</Link>
          </TextBody>

          <div className="flex gap-6">
            <a
              href="https://www.facebook.com/groups/464396007027802"
              target="_blank"
            >
              <img
                src="/static/svg/facebook.svg"
                alt="facebook"
                className="w-10 h-auto"
              />
            </a>
            <a href="https://zalo.me/g/rxkjpk038" target="_blank">
              <img
                src="/static/svg/zalo.svg"
                alt="zalo"
                className="w-10 h-auto"
              />
            </a>
            <a
              href="https://www.youtube.com/channel/UC-bVLpxpdo1GWQGvbQ5QXqA"
              target="_blank"
            >
              <img
                src="/static/svg/youtube.svg"
                alt="youtube"
                className="w-10 h-auto"
              />
            </a>
            <a
              href="https://discord.com/channels/1189814075539067011/1190324247978061959"
              target="_blank"
            >
              <img
                src="/static/svg/discord.svg"
                alt="discord"
                className="w-10 h-auto"
              />
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
