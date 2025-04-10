'use client';

import 'driver.js/dist/driver.css';
import { Inter } from 'next/font/google';
import { ReactElement } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Provider } from 'react-redux';
import 'react-responsive-modal/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import { SWRConfig } from 'swr';

import { PostHogProvider } from '@/components/PostHogProvider';
import { ToastContextHolder } from '@/components/common';
import AppWrapper from '@/components/ui/AppWrapper';
import Meta from '@/components/ui/Meta';

import store from '../store/store';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <html lang="en">
      <Meta
        title="Fillform"
        description="Fillform - Tạo form điền thông tin, điền rải, điền động, điền tự động"
      />

      <Script id="673b20fa1928d1aa8b0bffcf-setup">
        {`
              (function() { window.satismeter = window.satismeter || function() {(window.satismeter.q = window.satismeter.q || []).push(arguments);};window.satismeter.l = 1 * new Date();var script = document.createElement("script");var parent = document.getElementsByTagName("script")[0].parentNode;script.async = 1;script.src = "https://app.satismeter.com/js";parent.appendChild(script);})();
          `}
      </Script>
      <body className={inter.className}>
        <PostHogProvider>
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
        </PostHogProvider>
      </body>
    </html>
  );
}
