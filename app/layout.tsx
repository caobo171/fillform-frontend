'use client';

import { Inter } from 'next/font/google';
import { ReactElement } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Provider } from 'react-redux';
import 'react-responsive-modal/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'driver.js/dist/driver.css';
import { SWRConfig } from 'swr';

import { ToastContextHolder } from '@/components/common';
import AppWrapper from '@/components/ui/AppWrapper';

import store from '../store/store';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SWRConfig
          value={{
            shouldRetryOnError: false,
            revalidateOnFocus: false,
          }}
        >
          <Provider store={store}>

            <ToastContextHolder />

            <AppWrapper>{children}</AppWrapper>
          </Provider>
        </SWRConfig>
      </body>
    </html>
  );
}
