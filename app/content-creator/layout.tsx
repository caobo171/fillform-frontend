'use client';

import { MicrophoneIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Header } from '@/components/layout/header/Header';
import { SidebarLayout } from '@/components/layout/sidebar/sidebar-layout';
import { Button } from '@/components/ui/Button';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="min-h-full">
      <Header menu={{ subs: null, main: null }} searchUrl="/podcast">
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
                  href: '/content-creator/podcasts',
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
