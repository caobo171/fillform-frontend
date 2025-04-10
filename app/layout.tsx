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
      <Script>
        {
          `
          (function(t,r){function s(){var a=r.getElementsByTagName("script")[0],e=r.createElement("script");e.type="text/javascript",e.async=!0,e.src="https://widget.frill.co/v2/container.js",a.parentNode.insertBefore(e,a)}if(!t.Frill){var o=0,i={};t.Frill=function(e,p){var n,l=o++,c=new Promise(function(v,d){i[l]={params:[e,p],resolve:function(f){n=f,v(f)},reject:d}});return c.destroy=function(){delete i[l],n&&n.destroy()},c},t.Frill.q=i}r.readyState==="complete"||r.readyState==="interactive"?s():r.addEventListener("DOMContentLoaded",s)})(window,document);
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
