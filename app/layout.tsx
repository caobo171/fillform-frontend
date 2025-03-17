'use client';

import { Inter } from 'next/font/google';
import { ReactElement } from 'react';
import 'react-quill/dist/quill.snow.css';
import { Provider } from 'react-redux';
import 'react-responsive-modal/styles.css';
import 'react-toastify/dist/ReactToastify.css';
import 'driver.js/dist/driver.css';
import { SWRConfig } from 'swr';

import { QueueContent } from '@/app/_components/Queue/QueueContent';
import { ToastContextHolder } from '@/components/common';
import AppWrapper from '@/components/ui/AppWrapper';
import { QueueProvider } from '@/contexts';
import { PlayerProvider } from '@/contexts/PlayerContext';

import store from '../store/store';
import './globals.css';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: ReactElement }) {
  return (
    <html lang="en">
      <body className={inter.className}>
       <Script id="673b20fa1928d1aa8b0bffcf-setup">
          {`
            window.mindpalConfig = {
            chatbotId: "673b20fa1928d1aa8b0bffcf",
            chatbotAvatarUrl: "https://app.wele-learn.com/static/logo.svg",
            chatbotColor: "#e02329",
                };
          `}
        </Script>
        <Script id="detect-webview" strategy="beforeInteractive">
          {`
            function isWebView() {
              return !!window.ReactNativeWebView || /wv|WebView/.test(navigator.userAgent);
            }
            if (!isWebView()) {
              const script = document.createElement("script");
              script.src = "https://mindpal.space/embed.min.js";
              script.async = true;
              document.head.appendChild(script);
            }
          `}
        </Script>

        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5677666129047926`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <SWRConfig
          value={{
            shouldRetryOnError: false,
            revalidateOnFocus: false,
          }}
        >
          <Provider store={store}>
            <QueueProvider>
              <PlayerProvider>
                <QueueContent />

                <ToastContextHolder />

                <AppWrapper>{children}</AppWrapper>
              </PlayerProvider>
            </QueueProvider>
          </Provider>
        </SWRConfig>
      </body>
    </html>
  );
}
