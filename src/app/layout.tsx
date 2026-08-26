import type { Metadata } from 'next';

import './globals.css';

export const metadata: Metadata = {
  title: '참가 신청',
  description: '행사 참가 신청 사이트',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        <main className="min-h-screen w-full">{children}</main>
      </body>
    </html>
  );
}
