import type { Metadata } from 'next';
import { Poetsen_One, Geist_Mono } from 'next/font/google';
import './globals.css';
import Providers from '../lib/providers';
import { Toaster } from 'sonner';

const poetsenOne = Poetsen_One({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-poetsen-one',
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Conferoo  ',
  description: 'Live-communication platform ',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${poetsenOne.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Toaster richColors position="top-center" />
          {children}
        </Providers>
      </body>
    </html>
  );
}
