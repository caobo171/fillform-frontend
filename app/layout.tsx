'use client';

import 'driver.js/dist/driver.css';
import { Inter } from 'next/font/google';
import { ReactElement } from 'react';
import { Provider } from 'react-redux';
import 'react-responsive-modal/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-quill/dist/quill.snow.css';
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
      <Script>
        {
          `
          !function(){window.PulseSurvey=window.PulseSurvey||function(){(window.PulseSurvey.q=window.PulseSurvey.q||[]).push(arguments),window.PulseSurvey.app_domain='success.net',window.PulseSurvey.l=1*new Date,window.PulseSurvey.events=window.PulseSurvey.events||[];var e=document.createElement('script'),s=document.getElementsByTagName('script')[0].parentNode;e.async=1,e.src='https://static-success.stdfiles.com/pulses/js/distribute/widget.js',s.appendChild(e);}}();
          
          `
        }
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
