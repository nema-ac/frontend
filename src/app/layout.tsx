import { Inter, Fira_Code, VT323 } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next'
import { AppWalletProvider } from '@/components/app-wallet-provider';

const inter = Inter({ subsets: ['latin'] });
const firaCode = Fira_Code({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-fira-code'
});
const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-vt323'
});

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
    <html lang="en" className={`dark ${firaCode.variable} ${vt323.variable}`}>
      <body className={inter.className}>
        <AppWalletProvider>{children}</AppWalletProvider>
      </body>
    </html>
  );
}
