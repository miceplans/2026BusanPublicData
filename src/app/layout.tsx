import type { Metadata } from 'next';

import './globals.css';
import { ToastProvider } from '@/components/toast';

export const metadata: Metadata = {
  title: '2026 AI 창업 경진대회',
  description:
    '부산의 전략산업 분야 우수 AI 창업 아이디어를 발굴·육성하고 예비·초기 창업기업의 사업화를 지원하는 경진대회',
  icons: {
    icon: [
      { url: '/favicon.ico/favicon.ico', sizes: '16x16 32x32' },
      {
        url: '/favicon.ico/favicon-96x96.png',
        type: 'image/png',
        sizes: '96x96',
      },
    ],
    apple: [
      {
        url: '/favicon.ico/apple-icon-180x180.png',
        type: 'image/png',
        sizes: '180x180',
      },
    ],
  },
  manifest: '/favicon.ico/manifest.json',
  other: {
    'msapplication-config': '/favicon.ico/browserconfig.xml',
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <ToastProvider>
          <main className="min-h-screen w-full">{children}</main>
        </ToastProvider>
      </body>
    </html>
  );
}
