'use client';

import {
  ChatBubbleOvalLeftEllipsisIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Button } from '@/components/common';
import { Header } from '@/components/layout/header/Header';
import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-full">
      <Header searchUrl="/podcasts" menu={{ main: null, subs: null }}>
        <Button
          type="outline"
          size="small"
          onClick={() => router.push('/home')}
        >
          Back to app
        </Button>
      </Header>

      <main className="relative min-h-screen bg-gray-50">
        <SidebarLayout
          sections={[
            {
              id: 'main',
              name: 'Podcast',
              options: [
                {
                  name: 'Podcasts',
                  icon: MicrophoneIcon,
                  href: '/teacher/podcasts',
                },
                {
                  name: 'Classes',
                  icon: ChatBubbleOvalLeftEllipsisIcon,
                  href: '/teacher/classes',
                },
              ],
            },
          ]}
        >
          {children}
        </SidebarLayout>
      </main>
    </div>
  );
}
