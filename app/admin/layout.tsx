'use client';

import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/common';
import { Header } from '@/components/layout/header/Header';

import { SidebarLayoutWrapper } from './_components/SidebarLayoutWrapper';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      <Header menu={{ subs: null, main: null }} searchUrl="/admin">
        <Link href="/">
          <Button type="outline" size="small">
            Back to app
          </Button>
        </Link>
      </Header>

      <main className="relative min-h-screen bg-gray-50">
        <SidebarLayoutWrapper>{children}</SidebarLayoutWrapper>
      </main>
    </div>
  );
}
