import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '@librorumlegere · Книжная Полка',
  description:
    'Интерактивный журнал читаемых книг на основе телеграм-экспорта с фильтрацией, рейтингами и поиском.',
  openGraph: {
    title: '@librorumlegere',
    description:
      'Журнал прочитанных книг с разбивкой по тегам, рейтингу и заметкам из Telegram.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 dark:bg-slate-950`}
      >
        {children}
      </body>
    </html>
  );
}
