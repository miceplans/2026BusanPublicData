import type { Metadata } from 'next';

import './globals.css';
import { ToastProvider } from '@/components/toast';

export const metadata: Metadata = {
  title: '2026 해양수도 부산 AI 창업 경진대회',
  description: '부산 9대 전략산업 AI 스타트업 발굴 프로젝트 참가 신청 사이트',
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
