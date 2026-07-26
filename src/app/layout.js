// src/app/layout.js
import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './providers'; //  Import the client wrapper

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Momentum Learning',
  description: 'Premium EdTech Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 🔥 Wrap children in Providers. Layout remains a Server Component. */}
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}