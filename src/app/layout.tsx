import { Inter } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next'

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NEMA',
  description: 'Digital Neural Network Simulation Token',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        sizes: '16x16',
        type: 'image/x-icon',
      },
      {
        url: '/icon.png',
        sizes: '32x32',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=VT323&family=Fira+Code:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
